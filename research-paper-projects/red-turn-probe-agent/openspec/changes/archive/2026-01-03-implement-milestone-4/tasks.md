# Implementation Tasks for Milestone 4

## 1. Dependencies and Setup
- [x] 1.1 Install commander.js (^12.0.0)
- [x] 1.2 Install chalk (^5.3.0)
- [x] 1.3 Update package.json with new dependencies
- [x] 1.4 Verify TypeScript types available (@types/node covers commander)

## 2. Content Topic System
- [x] 2.1 Create src/content.ts module
- [x] 2.2 Define ContentTopic interface
- [x] 2.3 Define TopicContext interface with arguments and edge cases
- [x] 2.4 Implement healthcare topic data structure
- [x] 2.5 Include pro arguments (speed, accuracy, availability, error reduction)
- [x] 2.6 Include con arguments (accountability, moral agency, empathy, context)
- [x] 2.7 Include edge cases (fatal errors, two-tier system, consent, liability)
- [x] 2.8 Include stakeholders list
- [x] 2.9 Export healthcare content topic as default

## 3. Template Tactic System
- [x] 3.1 Create src/templates.ts module
- [x] 3.2 Define TemplateContext interface
- [x] 3.3 Define TemplateTactic interface
- [x] 3.4 Implement "acknowledge" tactic (recognize their position)
- [x] 3.5 Implement "extreme-case" tactic (present worst-case scenario)
- [x] 3.6 Implement "ethical-challenge" tactic (raise moral concerns)
- [x] 3.7 Implement "direct-challenge" tactic (force defense of position)
- [x] 3.8 Implement "dismiss" tactic (frame as missing the point)
- [x] 3.9 Implement "obvious-answer" tactic (present clear alternative)
- [x] 3.10 Implement "force-choice" tactic (demand concrete decision)
- [x] 3.11 Implement "eliminate-hedge" tactic (remove nuance escape)

## 4. Strategy Pattern Refactoring
- [x] 4.1 Define StrategyPattern interface in src/templates.ts
- [x] 4.2 Create escalate strategy pattern (acknowledge → extreme-case → ethical-challenge → direct-challenge)
- [x] 4.3 Create accuse strategy pattern (dismiss → obvious-answer)
- [x] 4.4 Create exploit-nuance strategy pattern (acknowledge → force-choice → eliminate-hedge)
- [x] 4.5 Create default strategy pattern (use static baseline prompt)
- [x] 4.6 Implement applyTemplate() function (strategy + content + context → prompt)
- [x] 4.7 Add template result type with generated prompt and metadata

## 5. Strategy Selection Update
- [x] 5.1 Update src/strategies.ts to use template-based approach
- [x] 5.2 Modify Strategy interface to reference StrategyPattern
- [x] 5.3 Update selectStrategy() to return template-based strategy
- [x] 5.4 Maintain existing category → strategy mapping logic
- [x] 5.5 Add templateMetadata to StrategySelection result
- [x] 5.6 Ensure backward compatibility with existing strategy names

## 6. CLI Enhancement with Commander
- [x] 6.1 Update src/index.ts to import commander and chalk
- [x] 6.2 Create program with name, description, version
- [x] 6.3 Add 'static' command for static baseline mode
- [x] 6.4 Add 'adaptive' command with --runs and --topic options
- [x] 6.5 Implement colored output (green=success, red=error, blue=info, yellow=warning)
- [x] 6.6 Add --help and --version support
- [x] 6.7 Migrate runStaticBaseline() to use chalk for colored output
- [x] 6.8 Remove old parseArgs() function
- [x] 6.9 Add backward compatibility check for old CLI style
- [x] 6.10 Update error handling to use chalk.red()

## 7. Adaptive Loop Integration
- [x] 7.1 Update src/adaptive-loop.ts to import template system
- [x] 7.2 Pass content topic to template application
- [x] 7.3 Update executeAdaptiveRun() to use template-generated prompts
- [x] 7.4 Update console output to use chalk for colored statistics
- [x] 7.5 Log template metadata (tactics used, arguments selected)

## 8. Logger Extension
- [x] 8.1 Extend AdaptiveMetadata interface with template fields
- [x] 8.2 Add tacticsUsed field (array of tactic names)
- [x] 8.3 Add argumentsSelected field (which pro/con args were used)
- [x] 8.4 Add contentTopic field (topic ID)
- [x] 8.5 Update logAdaptiveConversation() to include template metadata

## 9. Package.json Updates
- [x] 9.1 Update main script to support new CLI
- [x] 9.2 Update start scripts to use new command structure
- [x] 9.3 Add bin entry for 'redturn' command (optional)
- [x] 9.4 Update description to mention template-based approach

## 10. Documentation Updates
- [x] 10.1 Update README with new CLI usage examples
- [x] 10.2 Document template system architecture
- [x] 10.3 Add examples of both old and new CLI syntax
- [x] 10.4 Update milestone status to M4 complete
- [x] 10.5 Add note about strategy-content separation benefits

## 11. Testing and Validation
- [x] 11.1 Build project and fix TypeScript errors
- [x] 11.2 Test static command: redturn static
- [x] 11.3 Test adaptive command: redturn adaptive --runs 5
- [x] 11.4 Test help: redturn --help
- [x] 11.5 Test backward compatibility: node dist/index.js --adaptive
- [x] 11.6 Verify colored output in terminal
- [x] 11.7 Verify template-generated prompts are coherent
- [x] 11.8 Compare contradiction rates to M3 baseline (should be similar)
- [x] 11.9 Verify logs include template metadata
- [x] 11.10 Run OpenSpec validation: openspec validate implement-milestone-4 --strict

## 12. Stop Condition Verification
- [x] 12.1 Verify strategies can swap content without code changes
- [x] 12.2 Verify new tactics can be added without modifying strategy patterns
- [x] 12.3 Confirm healthcare content is replaceable with different topic structure
- [x] 12.4 Document that strategy-content separation is complete
