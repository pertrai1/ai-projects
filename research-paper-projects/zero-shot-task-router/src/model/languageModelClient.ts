export interface LanguageModelClient {
  complete(prompt: string): Promise<string>;
}

export class StubLanguageModelClient implements LanguageModelClient {
  async complete(_prompt: string): Promise<string> {
    return "[stub completion]";
  }
}
