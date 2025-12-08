# USDA Plant Image Recognition

## Purpose

Accepts a user photo (optionally geotagged), returns top-k species predictions (USDA symbol + common/scientific name + confidence), and displays a precomputed distribution map (GeoJSON polygons) for the predicted species. The POC uses the existing model artifacts currently being producing (TFJS model.json + weight shards) and USDA internal data (occurrence points or county presence) to precompute and serve polygons efficiently.

## Summary of recommended approach

- Run inference server-side (managed endpoint or container) due to large species cardinality and requirement for consistent preprocessing.
- Precompute species distribution polygons in PostGIS (materialized view or per-species GeoJSON), upload them to S3, and serve by CloudFront (cached) to the UI.
- The inference API returns the predicted USDA symbol(s). Angular then fetches the corresponding GeoJSON file from the static CDN and renders it on a map (Leaflet/Mapbox GL).
- This design separates prediction concerns (compute + model) from distribution serving (static, cached assets), giving low-latency map rendering and simple caching/scaling.

High-level architecture (POC)
- Angular frontend (existing UI)
  - User selects a plant photo from computer.
  - POST to Inference API (image + optional lat/lon)
  - Receive top-k predictions (symbol, scientific, common, scores)
  - Fetch GeoJSON
  - Render a map showing locations where the plant can be found with. Each location will have a marker with additional details and link to the profile
- Inference API
  - Receives photo
  - Optionally use lat/lon to do candidate reduction (server-side geo filter)
  - Forwards image to model endpoint (SageMaker/Triton/ECS)
  - Returns top-k with symbol(s)
  - Logs prediction + metadata to S3/RDS/Analytics store for active learning
- Model host
  - SageMaker Real-Time endpoint or Triton/ECS with GPU/CPU depending on model needs
  - Model artifacts in S3 (SavedModel or container image)
- Distribution assets
  - Precomputed species GeoJSON files (one per symbol), stored in S3 and served via CloudFront (or served from internal CDN if not public)
  - Precomputation runs on PostGIS and writes files
- Logging & feedback: S3 + Athena/Glue or RDS for feedback and retraining pipeline

Mapping model labels -> USDA symbol
- The model's label order must map to symbols. Store the mapping file with index → symbol (and names) in S3 or alongside model artifacts:
```json
// model_labels_to_usda.json
[
  { "index": 0, "label": "Bellis_perennis", "symbol": "BEPE", "scientific": "Bellis perennis", "common": "English daisy" },
  { "index": 1, "label": "Quercus_alba", "symbol": "QUAL", "scientific": "Quercus alba", "common": "White oak" }
]
```
- The inference API must use this mapping to translate softmax indices to USDA symbols and attach URL `https://plants.usda.gov/home/plantProfile?symbol={SYMBOL}`.

Inference API contract (POC)
- Endpoint: POST /predict
  - Request: multipart/form-data { file: image, lat?: number, lon?: number }
  - Response:
```json
{
  "topK": [
    { "symbol":"QUAL", "scientific":"Quercus alba", "common":"White oak", "score":0.87 },
    { "symbol":"QUNC", "scientific":"Quercus coccinea", "common":"Scarlet oak", "score":0.05 }
  ],
  "usedGeoFilter": true,
  "candidateCount": 432
}
```

Geo-filtering for improved precision (POC)
- If lat/lon provided, query a precomputed table or view to return list of species present in that region (state/county/hex bin).
- Two ways to use candidates:
  - Post-filter predictions: run full inference and filter results to candidate set.
  - Candidate-constrained inference: (advanced) pass candidate list to specialized classifier or do second-stage fine-grain classification limited to top candidate species.
