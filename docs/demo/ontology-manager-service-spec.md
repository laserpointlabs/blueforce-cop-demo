# Ontology Manager Service - Technical Specification

## 🎯 Service Overview

The Ontology Manager Service (Port 3015) is the semantic intelligence core of the Blue Force COP demonstration. It manages base defense ontologies, extracts semantic models from standards documentation, performs ontology alignment, and creates unified knowledge representations that drive intelligent integration.

## 🏗️ Service Architecture

### Core Responsibilities
1. **Base Ontology Management**: Store and version defense domain ontologies
2. **Semantic Extraction**: Mine ontological knowledge from technical documents
3. **Ontology Alignment**: Map and harmonize concepts across different standards
4. **Conflict Resolution**: Automatically resolve semantic inconsistencies
5. **Knowledge Validation**: Ensure ontological consistency and completeness
6. **Semantic Reasoning**: Infer new relationships and validate constraints
7. **Stretch Goal: Probabilistic Extraction**: Question-guided iterative extraction with statistical convergence

### Technology Stack
- **Runtime**: Node.js 18+ with TypeScript
- **Ontology Store**: Apache Jena Fuseki (RDF/OWL triple store)
- **Graph Database**: Neo4j (for relationship exploration)
- **Vector Store**: Qdrant (for semantic similarity)
- **Reasoning Engine**: Apache Jena (SPARQL and OWL reasoning)
- **Alignment Engine**: Custom semantic matching algorithms

## 📊 Data Models

### Base Defense Ontology Structure

```turtle
@prefix cop: <http://dadms.ai/ontology/cop#> .
@prefix defense: <http://dadms.ai/ontology/defense#> .
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix owl: <http://www.w3.org/2002/07/owl#> .

# Core Defense Concepts
defense:TacticalEntity rdf:type owl:Class ;
  rdfs:label "Tactical Entity" ;
  rdfs:comment "Base class for all tactical objects in defense systems" .

defense:Platform rdf:type owl:Class ;
  rdfs:subClassOf defense:TacticalEntity ;
  rdfs:label "Military Platform" ;
  rdfs:comment "Air, land, sea, space, or cyber military platform" .

defense:Track rdf:type owl:Class ;
  rdfs:subClassOf defense:TacticalEntity ;
  rdfs:label "Tactical Track" ;
  rdfs:comment "Detected or identified entity being tracked" .

defense:Message rdf:type owl:Class ;
  rdfs:label "Tactical Message" ;
  rdfs:comment "Communication between tactical systems" .

defense:Position rdf:type owl:Class ;
  rdfs:label "Geospatial Position" ;
  rdfs:comment "Location in space and time" .

# Core Properties
defense:hasPosition rdf:type owl:ObjectProperty ;
  rdfs:domain defense:TacticalEntity ;
  rdfs:range defense:Position .

defense:hasIdentification rdf:type owl:ObjectProperty ;
  rdfs:domain defense:TacticalEntity ;
  rdfs:range defense:Identification .

defense:transmits rdf:type owl:ObjectProperty ;
  rdfs:domain defense:Platform ;
  rdfs:range defense:Message .

defense:hasCoordinate rdf:type owl:DatatypeProperty ;
  rdfs:domain defense:Position ;
  rdfs:range xsd:decimal .

# Tactical Classifications
defense:Friend rdf:type owl:Class ;
  rdfs:subClassOf defense:TacticalEntity .

defense:Hostile rdf:type owl:Class ;
  rdfs:subClassOf defense:TacticalEntity .

defense:Neutral rdf:type owl:Class ;
  rdfs:subClassOf defense:TacticalEntity .

defense:Unknown rdf:type owl:Class ;
  rdfs:subClassOf defense:TacticalEntity .
```

### Link-16 Domain Ontology

```turtle
@prefix link16: <http://dadms.ai/ontology/link16#> .

# Link-16 Message Types
link16:JMessage rdf:type owl:Class ;
  rdfs:subClassOf defense:Message ;
  rdfs:label "Link-16 J-Message" .

link16:PPLI rdf:type owl:Class ;
  rdfs:subClassOf link16:JMessage ;
  rdfs:label "Precise Participant Location and Identification" .

link16:SPPLI rdf:type owl:Class ;
  rdfs:subClassOf link16:PPLI ;
  rdfs:label "Surface PPLI" .

link16:APPLI rdf:type owl:Class ;
  rdfs:subClassOf link16:PPLI ;
  rdfs:label "Air PPLI" .

# Link-16 Properties
link16:hasTN rdf:type owl:DatatypeProperty ;
  rdfs:domain link16:PPLI ;
  rdfs:range xsd:integer ;
  rdfs:label "Track Number" ;
  rdfs:comment "Unique identifier for tracked entity" .

link16:hasJSeries rdf:type owl:DatatypeProperty ;
  rdfs:domain link16:JMessage ;
  rdfs:range xsd:string ;
  rdfs:label "J-Series Identifier" .

link16:hasTimeSlot rdf:type owl:DatatypeProperty ;
  rdfs:domain link16:JMessage ;
  rdfs:range xsd:integer .

# Link-16 Specific Concepts
link16:NPG rdf:type owl:Class ;
  rdfs:label "Net Participation Group" ;
  rdfs:comment "Group of platforms sharing Link-16 data" .

link16:TADIL_J rdf:type owl:Class ;
  rdfs:subClassOf defense:Message ;
  rdfs:label "Tactical Digital Information Link - J" .
```

### VMF Domain Ontology

```turtle
@prefix vmf: <http://dadms.ai/ontology/vmf#> .

# VMF Message Structure
vmf:VariableMessage rdf:type owl:Class ;
  rdfs:subClassOf defense:Message ;
  rdfs:label "Variable Message Format" .

vmf:PositionReport rdf:type owl:Class ;
  rdfs:subClassOf vmf:VariableMessage ;
  rdfs:label "VMF Position Report" .

vmf:StatusReport rdf:type owl:Class ;
  rdfs:subClassOf vmf:VariableMessage ;
  rdfs:label "VMF Status Report" .

# VMF Properties
vmf:hasUTN rdf:type owl:DatatypeProperty ;
  rdfs:domain vmf:VariableMessage ;
  rdfs:range xsd:string ;
  rdfs:label "Unit Track Number" .

vmf:hasLatitude rdf:type owl:DatatypeProperty ;
  rdfs:domain vmf:PositionReport ;
  rdfs:range xsd:decimal .

vmf:hasLongitude rdf:type owl:DatatypeProperty ;
  rdfs:domain vmf:PositionReport ;
  rdfs:range xsd:decimal .

# VMF Field Definitions
vmf:MessageHeader rdf:type owl:Class ;
  rdfs:label "VMF Message Header" .

vmf:DataField rdf:type owl:Class ;
  rdfs:label "VMF Data Field" .
```

## 🔧 API Specification

### RESTful Endpoints

#### Ontology Management
```typescript
// Get base ontology for a domain
GET /api/ontologies/base/{domain}
Response: OntologyReference

// Load base ontology from file
POST /api/ontologies/base/load
Body: { file: File, domain: string }
Response: OntologyReference

// Get ontology in various formats
GET /api/ontologies/{id}/export?format={turtle|rdf|owl|json-ld}
Response: string (serialized ontology)

// List available ontologies
GET /api/ontologies
Response: OntologyReference[]
```

#### Semantic Extraction
```typescript
// Extract ontology from technical document
POST /api/extraction/ontology
Body: {
  document_id: string,
  standard_type: 'LINK_16' | 'VMF' | 'GENERIC',
  extraction_config: ExtractionConfig
}
Response: ExtractedOntology

// Get extraction progress
GET /api/extraction/{job_id}/status
Response: ExtractionStatus

// Get extracted concepts
GET /api/extraction/{job_id}/concepts
Response: SemanticConcept[]
```

#### Ontology Alignment
```typescript
// Align two ontologies
POST /api/alignment/create
Body: {
  source_ontology_id: string,
  target_ontology_id: string,
  alignment_strategy: AlignmentStrategy
}
Response: SemanticAlignment

// Get alignment results
GET /api/alignment/{alignment_id}
Response: SemanticAlignment

// Resolve semantic conflicts
POST /api/alignment/{alignment_id}/resolve-conflicts
Body: ConflictResolution[]
Response: SemanticAlignment
```

#### Unified Knowledge Model
```typescript
// Create unified ontology
POST /api/unified/create
Body: {
  base_ontology_id: string,
  integrated_ontologies: string[],
  workflow_id: string
}
Response: UnifiedOntology

// Validate unified ontology
POST /api/unified/{unified_id}/validate
Response: OntologyValidationResult

// Query unified knowledge model
POST /api/unified/{unified_id}/query
Body: { sparql_query: string }
Response: QueryResult
```

#### Semantic Reasoning
```typescript
// Perform reasoning over ontology
POST /api/reasoning/infer
Body: {
  ontology_id: string,
  reasoning_type: 'CLASSIFICATION' | 'CONSISTENCY' | 'ENTAILMENT'
}
Response: ReasoningResult

// Check semantic consistency
GET /api/reasoning/{ontology_id}/consistency
Response: ConsistencyResult
```

#### Stretch Goal: Probabilistic Extraction
```typescript
// Start question-guided probabilistic extraction
POST /api/extraction/probabilistic
Body: {
  document_id: string,
  standard_type: 'LINK_16' | 'VMF',
  question_set: QuestionSet,
  convergence_criteria: ConvergenceCriteria
}
Response: ProbabilisticExtractionJob

// Get probabilistic extraction progress
GET /api/extraction/probabilistic/{job_id}/progress
Response: ExtractionProgress

// Get convergence analysis
GET /api/extraction/probabilistic/{job_id}/convergence
Response: ConvergenceAnalysis

// Get final converged ontology
GET /api/extraction/probabilistic/{job_id}/result
Response: ConvergedOntology
```

### WebSocket Endpoints

#### Real-time Ontology Updates
```typescript
// Subscribe to ontology changes
WS /ws/ontologies/{ontology_id}/updates
Events: 'concept_added', 'relationship_modified', 'conflict_detected'

// Subscribe to alignment progress
WS /ws/alignment/{alignment_id}/progress
Events: 'mapping_discovered', 'conflict_identified', 'resolution_suggested'
```

## 🧠 Semantic Processing Algorithms

### Concept Extraction Algorithm

```typescript
class ConceptExtractor {
  async extractFromDocument(document: Document, standard: StandardType): Promise<SemanticConcept[]> {
    // 1. Text preprocessing and chunking
    const chunks = this.preprocessDocument(document);
    
    // 2. Named entity recognition for technical terms
    const entities = await this.extractTechnicalEntities(chunks);
    
    // 3. Relationship extraction using LLM
    const relationships = await this.extractRelationships(entities, chunks);
    
    // 4. Concept hierarchy inference
    const hierarchy = this.inferConceptHierarchy(entities, relationships);
    
    // 5. Property and constraint identification
    const properties = this.extractProperties(chunks, entities);
    const constraints = this.identifyConstraints(chunks, entities);
    
    // 6. Confidence scoring
    return this.buildSemanticConcepts(entities, hierarchy, properties, constraints);
  }

  private async extractTechnicalEntities(chunks: string[]): Promise<Entity[]> {
    // Use NER models trained on military standards
    // Enhanced with LLM-based entity recognition
  }

  private async extractRelationships(entities: Entity[], chunks: string[]): Promise<Relationship[]> {
    // LLM-based relationship extraction
    // Pattern matching for common relationship types
  }
}
```

### Ontology Alignment Algorithm

```typescript
class OntologyAligner {
  async alignOntologies(source: Ontology, target: Ontology): Promise<SemanticAlignment> {
    // 1. Lexical similarity matching
    const lexicalMappings = this.computeLexicalSimilarity(source, target);
    
    // 2. Structural similarity analysis
    const structuralMappings = this.analyzeStructuralSimilarity(source, target);
    
    // 3. Semantic similarity using embeddings
    const semanticMappings = await this.computeSemanticSimilarity(source, target);
    
    // 4. Constraint-based reasoning
    const constraintMappings = this.applyConstraintReasoning(source, target);
    
    // 5. Mapping combination and ranking
    const combinedMappings = this.combineMappings([
      lexicalMappings, 
      structuralMappings, 
      semanticMappings, 
      constraintMappings
    ]);
    
    // 6. Conflict detection
    const conflicts = this.detectConflicts(combinedMappings);
    
    return this.createAlignment(combinedMappings, conflicts);
  }

  private async computeSemanticSimilarity(source: Ontology, target: Ontology): Promise<ConceptMapping[]> {
    // Use sentence transformers for concept embeddings
    // Compute cosine similarity in embedding space
    // Apply threshold filtering
  }
}
```

### Conflict Resolution Engine

```typescript
class ConflictResolver {
  async resolveConflicts(conflicts: SemanticConflict[]): Promise<ConflictResolution[]> {
    const resolutions: ConflictResolution[] = [];
    
    for (const conflict of conflicts) {
      switch (conflict.type) {
        case 'CONCEPT_OVERLAP':
          resolutions.push(await this.resolveConceptOverlap(conflict));
          break;
        case 'PROPERTY_MISMATCH':
          resolutions.push(await this.resolvePropertyMismatch(conflict));
          break;
        case 'CONSTRAINT_VIOLATION':
          resolutions.push(await this.resolveConstraintViolation(conflict));
          break;
        case 'INCONSISTENT_HIERARCHY':
          resolutions.push(await this.resolveHierarchyInconsistency(conflict));
          break;
      }
    }
    
    return resolutions;
  }

  private async resolveConceptOverlap(conflict: SemanticConflict): Promise<ConflictResolution> {
    // Strategy 1: Create superclass for overlapping concepts
    // Strategy 2: Merge concepts if highly similar
    // Strategy 3: Differentiate with additional properties
    
    const strategy = await this.selectResolutionStrategy(conflict);
    return this.applyResolutionStrategy(conflict, strategy);
  }
}
```

## 📊 Performance Specifications

### Ontology Processing Performance
- **Base Ontology Loading**: < 2 seconds for 10,000 concepts
- **Concept Extraction**: < 3 minutes for 100-page technical document
- **Ontology Alignment**: < 2 minutes for ontologies with 1,000 concepts each
- **Conflict Resolution**: < 30 seconds for 50 detected conflicts
- **Unified Model Creation**: < 1 minute for integration of 3 ontologies

### Memory and Storage
- **Memory Usage**: < 2GB for active ontology processing
- **Storage**: RDF triple store with 1M+ triples
- **Query Response**: < 500ms for SPARQL queries over unified model
- **Concurrent Users**: Support 10 simultaneous ontology operations

### Quality Metrics
- **Extraction Accuracy**: > 90% concept identification from technical docs
- **Alignment Precision**: > 95% correct concept mappings
- **Consistency**: 100% logically consistent unified ontologies
- **Coverage**: > 85% of document semantics captured in ontology

## 🚀 Implementation Priority

### Phase 1: Foundation (Days 1-2)
1. **Service Infrastructure**: Basic Express.js service with TypeScript
2. **RDF Store Integration**: Apache Jena Fuseki setup and connection
3. **Base Ontology Loading**: Defense domain ontology management
4. **Basic API Endpoints**: CRUD operations for ontologies

### Phase 2: Extraction (Days 3-4)
1. **Document Processing**: PDF/DOCX parsing and text extraction
2. **LLM Integration**: Concept extraction using domain-specific prompts
3. **Concept Modeling**: Convert extracted information to RDF/OWL
4. **Quality Assessment**: Confidence scoring and validation

### Phase 3: Alignment (Days 5-6)
1. **Similarity Computing**: Lexical, structural, and semantic matching
2. **Conflict Detection**: Automated inconsistency identification
3. **Resolution Engine**: Rule-based conflict resolution strategies
4. **Unified Model Creation**: Merge aligned ontologies into unified representation

### Phase 4: Integration (Days 7-8)
1. **Persona Integration**: Connect with Standards Analyst and Data Modeler
2. **Workflow Integration**: Embed in Task Orchestrator workflow
3. **UI Components**: Ontology visualization in PM dashboard
4. **Performance Optimization**: Caching and query optimization

## 🔍 Testing Strategy

### Unit Tests
- Ontology loading and serialization
- Concept extraction accuracy
- Alignment algorithm correctness
- Conflict resolution logic

### Integration Tests
- End-to-end ontology extraction workflow
- Multi-ontology alignment scenarios
- Unified model generation and validation
- Service integration with other DADMS components

### Performance Tests
- Large ontology processing benchmarks
- Concurrent operation stress testing
- Memory usage monitoring
- Query response time validation

### Demo Validation Tests
- Link-16 extraction accuracy with sample documents
- VMF alignment quality with defense ontology
- Unified model consistency and completeness
- Real-time processing within demo time constraints

---

**The Ontology Manager Service transforms our COP demonstration from syntactic integration to true semantic interoperability, positioning DADMS as a next-generation knowledge-driven integration platform! 🧠🚀**
