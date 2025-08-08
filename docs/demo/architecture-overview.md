# Blue Force COP Demo - System Architecture

## 🏗️ Architecture Overview

This document provides the complete system architecture for the Blue Force Common Operating Picture (COP) demonstration, showcasing ontology-driven semantic interoperability through AI personas.

## 🎯 High-Level System Architecture

```mermaid
%%{init: { 'flowchart': { 'curve': 'basis' }}}%%
flowchart TB
    subgraph PM_Layer["Program Manager Interface"]
        Dashboard["PM Dashboard<br/>Real-time Monitoring"]
        Controls["Workflow Controls<br/>Feedback Interface"]
        Ontology_View["Ontology Explorer<br/>Semantic Relationships"]
    end

    subgraph Orchestration["Task Orchestration Layer"]
        TaskOrch["Task Orchestrator<br/>Port 3017"]
        WorkflowMgr["Workflow Manager"]
        PersonaCoord["Persona Coordinator"]
    end

    subgraph Personas["Enhanced AI Personas Layer"]
        SA["Standards Analyst<br/>Ontology Extraction"]
        DM["Data Modeler<br/>Semantic Alignment"]
        DPE["Pipeline Engineer<br/>Ontology-Driven Code"]
        UXP["UI/UX Prototyper<br/>Semantic Visualization"]
    end

    subgraph Knowledge_Layer["Knowledge & Ontology Layer"]
        OntMgr["Ontology Manager<br/>Port 3015"]
        BaseOnt["Base Defense<br/>Ontology"]
        Link16Ont["Link-16<br/>Extracted Ontology"]
        VMFOnt["VMF<br/>Extracted Ontology"]
        UnifiedOnt["Unified<br/>Semantic Model"]
    end

    subgraph Services["Enhanced DADMS Services"]
        LLM["LLM Service<br/>Port 3002<br/>Semantic Reasoning"]
        Knowledge["Knowledge Service<br/>Port 3003<br/>Ontology Mining"]
        CodeGen["Code Generator<br/>Port 3018<br/>Semantic Pipelines"]
        Viz["COP Visualization<br/>Port 3019<br/>Ontology-Aware"]
        OntWorkspace["Ontology Workspace<br/>Port 3016<br/>Interactive Modeling"]
    end

    subgraph Data["Data & Storage Layer"]
        PG[(PostgreSQL<br/>Workflow & Metadata)]
        Qdrant[(Qdrant<br/>Semantic Vectors)]
        Redis[(Redis<br/>Real-time State)]
        KnowledgeGraph[(Knowledge Graph<br/>RDF/OWL Store)]
        Artifacts[("Generated Artifacts<br/>Semantic Code")]
    end

    subgraph Demo["Demo Scenario Data"]
        Link16["Link-16 Standards<br/>Technical Docs"]
        VMF["VMF Specifications<br/>Format Definitions"]
        COP_Data["COP Display Data<br/>Tactical Scenarios"]
    end

    %% PM Interface Connections
    Dashboard --> TaskOrch
    Controls --> TaskOrch
    Ontology_View --> OntMgr

    %% Orchestration Connections
    TaskOrch --> WorkflowMgr
    TaskOrch --> PersonaCoord
    WorkflowMgr --> Redis
    PersonaCoord --> SA
    PersonaCoord --> DM
    PersonaCoord --> DPE
    PersonaCoord --> UXP

    %% Ontology Integration Flow
    SA --> Knowledge
    SA --> OntMgr
    Knowledge --> Link16Ont
    Knowledge --> VMFOnt
    
    OntMgr --> BaseOnt
    Link16Ont --> OntMgr
    VMFOnt --> OntMgr
    OntMgr --> UnifiedOnt
    
    DM --> OntMgr
    DM --> UnifiedOnt
    
    UnifiedOnt --> DPE
    UnifiedOnt --> UXP

    %% Service Connections
    SA --> LLM
    DM --> LLM
    DPE --> LLM
    UXP --> LLM
    
    DPE --> CodeGen
    UXP --> Viz
    OntMgr --> OntWorkspace

    %% Data Layer Connections
    LLM --> Redis
    Knowledge --> Qdrant
    OntMgr --> KnowledgeGraph
    CodeGen --> Artifacts
    Viz --> PG
    TaskOrch --> PG

    %% Demo Data Connections
    Link16 --> Knowledge
    VMF --> Knowledge
    COP_Data --> Viz

    %% Enhanced Inter-persona Communication
    SA -.->|"Semantic Models"| DM
    DM -.->|"Unified Ontology"| DPE
    DM -.->|"Semantic Schema"| UXP
    DPE -.->|"Code Artifacts"| UXP

    %% Semantic Feedback Loops
    UnifiedOnt -.->|"Validation"| SA
    Artifacts -.->|"Testing Results"| DM

    %% Styling
    classDef pmStyle fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef orchestratorStyle fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
    classDef personaStyle fill:#e8f5e8,stroke:#1b5e20,stroke-width:2px
    classDef knowledgeStyle fill:#fff8e1,stroke:#f57f17,stroke-width:2px
    classDef serviceStyle fill:#fff3e0,stroke:#e65100,stroke-width:2px
    classDef dataStyle fill:#fce4ec,stroke:#880e4f,stroke-width:2px

    class Dashboard,Controls,Ontology_View pmStyle
    class TaskOrch,WorkflowMgr,PersonaCoord orchestratorStyle
    class SA,DM,DPE,UXP personaStyle
    class OntMgr,BaseOnt,Link16Ont,VMFOnt,UnifiedOnt knowledgeStyle
    class LLM,Knowledge,CodeGen,Viz,OntWorkspace serviceStyle
    class PG,Qdrant,Redis,KnowledgeGraph,Artifacts,Link16,VMF,COP_Data dataStyle
```

## 🔄 Semantic Integration Data Flow

```mermaid
%%{init: { 'flowchart': { 'curve': 'basis' }}}%%
flowchart TB
    subgraph Input["Input Standards & Base Knowledge"]
        Link16Doc["Link-16<br/>Technical Specifications"]
        VMFDoc["VMF<br/>Documentation"]
        BaseDefOnt["Base Defense<br/>Ontology"]
    end

    subgraph Analysis["Standards Analysis & Extraction"]
        SA_Parse["Standards Analyst<br/>Document Parsing"]
        SchemaExt["Schema Extraction"]
        OntExtract["Ontology Mining<br/>Concept Extraction"]
        ComplianceAnal["Compliance Analysis"]
    end

    subgraph Ontology["Ontology Integration Layer"]
        OntMgr["Ontology Manager<br/>Semantic Processing"]
        
        subgraph Alignment["Semantic Alignment"]
            ConceptMap["Concept Mapping"]
            ConflictDetect["Conflict Detection"]
            ConflictResolve["Conflict Resolution"]
        end
        
        subgraph Integration["Knowledge Integration"]
            UnifiedCreate["Unified Model Creation"]
            Validation["Ontological Validation"]
            Reasoning["Semantic Reasoning"]
        end
    end

    subgraph Generation["Knowledge-Driven Generation"]
        DM_Align["Data Modeler<br/>Semantic Harmonization"]
        DPE_CodeGen["Pipeline Engineer<br/>Ontology-Driven Code"]
        UXP_Viz["UI Prototyper<br/>Semantic Visualization"]
        
        subgraph Outputs["Generated Artifacts"]
            SemanticParsers["Semantic Parsers"]
            KnowledgePipelines["Knowledge Pipelines"]
            OntologyAwareUI["Ontology-Aware UI"]
            IntegratedOnt["Integrated Ontology"]
        end
    end

    subgraph Validation_Layer["Validation & Testing"]
        SemanticValidation["Semantic Validation"]
        InteropTesting["Interoperability Testing"]
        QualityAssurance["Quality Assurance"]
    end

    %% Data Flow Connections
    Link16Doc --> SA_Parse
    VMFDoc --> SA_Parse
    BaseDefOnt --> OntMgr
    
    SA_Parse --> SchemaExt
    SA_Parse --> OntExtract
    SA_Parse --> ComplianceAnal
    
    SchemaExt --> OntMgr
    OntExtract --> OntMgr
    ComplianceAnal --> OntMgr
    
    OntMgr --> ConceptMap
    ConceptMap --> ConflictDetect
    ConflictDetect --> ConflictResolve
    ConflictResolve --> UnifiedCreate
    UnifiedCreate --> Validation
    Validation --> Reasoning
    
    Reasoning --> DM_Align
    Reasoning --> DPE_CodeGen
    Reasoning --> UXP_Viz
    
    DM_Align --> SemanticParsers
    DPE_CodeGen --> KnowledgePipelines
    UXP_Viz --> OntologyAwareUI
    Reasoning --> IntegratedOnt
    
    SemanticParsers --> SemanticValidation
    KnowledgePipelines --> InteropTesting
    OntologyAwareUI --> QualityAssurance
    IntegratedOnt --> SemanticValidation

    %% Feedback Loops
    SemanticValidation -.->|"Validation Results"| DM_Align
    InteropTesting -.->|"Test Results"| DPE_CodeGen
    QualityAssurance -.->|"Quality Feedback"| UXP_Viz

    %% Styling
    classDef inputStyle fill:#e3f2fd,stroke:#0d47a1,stroke-width:2px
    classDef analysisStyle fill:#e8f5e8,stroke:#1b5e20,stroke-width:2px
    classDef ontologyStyle fill:#fff3e0,stroke:#e65100,stroke-width:2px
    classDef generationStyle fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
    classDef validationStyle fill:#fce4ec,stroke:#880e4f,stroke-width:2px

    class Link16Doc,VMFDoc,BaseDefOnt inputStyle
    class SA_Parse,SchemaExt,OntExtract,ComplianceAnal analysisStyle
    class OntMgr,ConceptMap,ConflictDetect,ConflictResolve,UnifiedCreate,Validation,Reasoning ontologyStyle
    class DM_Align,DPE_CodeGen,UXP_Viz,SemanticParsers,KnowledgePipelines,OntologyAwareUI,IntegratedOnt generationStyle
    class SemanticValidation,InteropTesting,QualityAssurance validationStyle
```

## 🏢 Infrastructure Architecture

```mermaid
%%{init: { 'flowchart': { 'curve': 'orthogonal' }}}%%
flowchart TB
    subgraph Development["Development Environment"]
        subgraph UI_Layer["User Interface Layer"]
            UI_Container["DADMS UI<br/>React/TypeScript<br/>Port 3000"]
            PM_Dashboard["PM Dashboard<br/>COP Demo Interface"]
        end
        
        subgraph Service_Layer["Microservices Layer"]
            TaskOrch_Service["Task Orchestrator<br/>Node.js/TypeScript<br/>Port 3017"]
            OntMgr_Service["Ontology Manager<br/>Node.js/TypeScript<br/>Port 3015"]
            LLM_Service["LLM Service<br/>Node.js/TypeScript<br/>Port 3002"]
            Knowledge_Service["Knowledge Service<br/>Node.js/TypeScript<br/>Port 3003"]
            CodeGen_Service["Code Generator<br/>Node.js/TypeScript<br/>Port 3018"]
            Viz_Service["COP Visualization<br/>Node.js/TypeScript<br/>Port 3019"]
            OntWorkspace_Service["Ontology Workspace<br/>Node.js/TypeScript<br/>Port 3016"]
        end
        
        subgraph Data_Layer["Data & Storage Layer"]
            PG_Container["PostgreSQL<br/>Workflow & Metadata<br/>Port 5432"]
            Neo4j_Container["Neo4j Main<br/>Memory System<br/>Port 7474/7687"]
            Neo4j_Memory["Neo4j Memory<br/>Secondary Instance<br/>Port 7475/7688"]
            Redis_Container["Redis<br/>Session & Cache<br/>Port 6379"]
            Qdrant_Container["Qdrant<br/>Vector Store<br/>Port 6333"]
            Fuseki_Container["Apache Jena Fuseki<br/>RDF Triple Store<br/>Port 3030"]
        end
        
        subgraph Management["Management & Orchestration"]
            Docker_Compose["Docker Compose<br/>Container Orchestration"]
            PM2["PM2<br/>Process Management"]
            NGINX["NGINX<br/>Reverse Proxy<br/>Port 80/443"]
        end
    end

    %% UI Connections
    NGINX --> UI_Container
    UI_Container --> PM_Dashboard
    PM_Dashboard --> TaskOrch_Service

    %% Service Connections
    TaskOrch_Service --> LLM_Service
    TaskOrch_Service --> OntMgr_Service
    OntMgr_Service --> Knowledge_Service
    OntMgr_Service --> CodeGen_Service
    OntMgr_Service --> Viz_Service
    OntMgr_Service --> OntWorkspace_Service

    %% Data Connections
    TaskOrch_Service --> PG_Container
    TaskOrch_Service --> Redis_Container
    LLM_Service --> Neo4j_Container
    Knowledge_Service --> Qdrant_Container
    OntMgr_Service --> Fuseki_Container
    OntWorkspace_Service --> Neo4j_Memory

    %% Management Connections
    Docker_Compose --> PG_Container
    Docker_Compose --> Neo4j_Container
    Docker_Compose --> Neo4j_Memory
    Docker_Compose --> Redis_Container
    Docker_Compose --> Qdrant_Container
    Docker_Compose --> Fuseki_Container
    
    PM2 --> TaskOrch_Service
    PM2 --> OntMgr_Service
    PM2 --> LLM_Service
    PM2 --> Knowledge_Service
    PM2 --> CodeGen_Service
    PM2 --> Viz_Service
    PM2 --> OntWorkspace_Service

    %% Styling
    classDef uiStyle fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef serviceStyle fill:#e8f5e8,stroke:#1b5e20,stroke-width:2px
    classDef dataStyle fill:#fff3e0,stroke:#e65100,stroke-width:2px
    classDef mgmtStyle fill:#f3e5f5,stroke:#4a148c,stroke-width:2px

    class UI_Container,PM_Dashboard uiStyle
    class TaskOrch_Service,OntMgr_Service,LLM_Service,Knowledge_Service,CodeGen_Service,Viz_Service,OntWorkspace_Service serviceStyle
    class PG_Container,Neo4j_Container,Neo4j_Memory,Redis_Container,Qdrant_Container,Fuseki_Container dataStyle
    class Docker_Compose,PM2,NGINX mgmtStyle
```

## 🎭 AI Persona Interaction Architecture

```mermaid
%%{init: { 'flowchart': { 'curve': 'basis' }}}%%
flowchart LR
    subgraph Orchestration["Task Orchestration"]
        TaskOrch["Task Orchestrator<br/>Workflow Coordination"]
        PersonaManager["Persona Manager<br/>Lifecycle Management"]
    end

    subgraph Standards_Analyst["Standards Analyst Persona"]
        SA_Parse["Document Parsing"]
        SA_Extract["Schema Extraction"]
        SA_Ontology["Ontology Mining"]
        SA_Compliance["Compliance Analysis"]
    end

    subgraph Data_Modeler["Data Modeler Persona"]
        DM_Align["Ontology Alignment"]
        DM_Conflict["Conflict Resolution"]
        DM_Unify["Unified Model Creation"]
        DM_Validate["Semantic Validation"]
    end

    subgraph Pipeline_Engineer["Pipeline Engineer Persona"]
        PE_Design["Pipeline Design"]
        PE_Generate["Code Generation"]
        PE_Semantic["Semantic Integration"]
        PE_Test["Interoperability Testing"]
    end

    subgraph UX_Prototyper["UI/UX Prototyper Persona"]
        UX_Design["Interface Design"]
        UX_Visualize["Data Visualization"]
        UX_Ontology["Ontology Display"]
        UX_Prototype["Interactive Prototyping"]
    end

    subgraph Shared_Services["Shared AI Services"]
        LLM_Reasoning["LLM Service<br/>Semantic Reasoning"]
        Knowledge_Base["Knowledge Service<br/>Information Retrieval"]
        Memory_System["Memory System<br/>Context Preservation"]
    end

    %% Orchestration to Personas
    TaskOrch --> PersonaManager
    PersonaManager --> SA_Parse
    PersonaManager --> DM_Align
    PersonaManager --> PE_Design
    PersonaManager --> UX_Design

    %% Standards Analyst Flow
    SA_Parse --> SA_Extract
    SA_Extract --> SA_Ontology
    SA_Ontology --> SA_Compliance

    %% Data Modeler Flow
    DM_Align --> DM_Conflict
    DM_Conflict --> DM_Unify
    DM_Unify --> DM_Validate

    %% Pipeline Engineer Flow
    PE_Design --> PE_Generate
    PE_Generate --> PE_Semantic
    PE_Semantic --> PE_Test

    %% UX Prototyper Flow
    UX_Design --> UX_Visualize
    UX_Visualize --> UX_Ontology
    UX_Ontology --> UX_Prototype

    %% Shared Service Connections
    SA_Ontology --> LLM_Reasoning
    DM_Align --> LLM_Reasoning
    PE_Generate --> LLM_Reasoning
    UX_Design --> LLM_Reasoning

    SA_Extract --> Knowledge_Base
    DM_Unify --> Knowledge_Base
    PE_Semantic --> Knowledge_Base
    UX_Ontology --> Knowledge_Base

    SA_Compliance --> Memory_System
    DM_Validate --> Memory_System
    PE_Test --> Memory_System
    UX_Prototype --> Memory_System

    %% Inter-Persona Communication
    SA_Ontology -.->|"Extracted Ontologies"| DM_Align
    DM_Unify -.->|"Unified Semantic Model"| PE_Design
    DM_Unify -.->|"Semantic Schema"| UX_Design
    PE_Generate -.->|"Generated Artifacts"| UX_Visualize

    %% Feedback Loops
    DM_Validate -.->|"Validation Results"| SA_Compliance
    PE_Test -.->|"Test Results"| DM_Conflict
    UX_Prototype -.->|"UI Feedback"| PE_Semantic

    %% Styling
    classDef orchStyle fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
    classDef saStyle fill:#e3f2fd,stroke:#0d47a1,stroke-width:2px
    classDef dmStyle fill:#e8f5e8,stroke:#1b5e20,stroke-width:2px
    classDef peStyle fill:#fff3e0,stroke:#e65100,stroke-width:2px
    classDef uxStyle fill:#fce4ec,stroke:#880e4f,stroke-width:2px
    classDef sharedStyle fill:#fff8e1,stroke:#f57f17,stroke-width:2px

    class TaskOrch,PersonaManager orchStyle
    class SA_Parse,SA_Extract,SA_Ontology,SA_Compliance saStyle
    class DM_Align,DM_Conflict,DM_Unify,DM_Validate dmStyle
    class PE_Design,PE_Generate,PE_Semantic,PE_Test peStyle
    class UX_Design,UX_Visualize,UX_Ontology,UX_Prototype uxStyle
    class LLM_Reasoning,Knowledge_Base,Memory_System sharedStyle
```

## 📊 Port Allocation & Service Registry

| Service | Port | Purpose | Technology | Dependencies |
|---------|------|---------|------------|--------------|
| **DADMS UI** | 3000 | Program Manager Dashboard | React/TypeScript | - |
| **LLM Service** | 3002 | AI Reasoning & Persona Logic | Node.js/Express | OpenAI/Claude APIs |
| **Knowledge Service** | 3003 | Document Storage & Ontology Mining | Node.js/Express | Qdrant, PostgreSQL |
| **Ontology Manager** | 3015 | Semantic Processing & Alignment | Node.js/Express | Apache Jena Fuseki |
| **Ontology Workspace** | 3016 | Interactive Ontology Development | Node.js/Express | Neo4j Memory |
| **Task Orchestrator** | 3017 | Workflow & Persona Coordination | Node.js/Express | PostgreSQL, Redis |
| **Code Generator** | 3018 | Ontology-Driven Code Generation | Node.js/Express | - |
| **COP Visualization** | 3019 | Tactical Display Generation | Node.js/Express | PostgreSQL |
| **PostgreSQL** | 5432 | Primary Database | PostgreSQL 15 | - |
| **Redis** | 6379 | Cache & Session Store | Redis 7 | - |
| **Qdrant** | 6333 | Vector Database | Qdrant | - |
| **Neo4j Main** | 7474/7687 | Graph Database (HTTP/Bolt) | Neo4j | - |
| **Neo4j Memory** | 7475/7688 | Memory System (HTTP/Bolt) | Neo4j | - |
| **Apache Jena Fuseki** | 3030 | RDF Triple Store | Jena Fuseki | - |

## 🔒 Security Architecture

```mermaid
%%{init: { 'flowchart': { 'curve': 'orthogonal' }}}%%
flowchart TB
    subgraph Security_Layers["Security Architecture Layers"]
        
        subgraph Network_Security["Network Security"]
            Firewall["Firewall Rules<br/>Port Access Control"]
            VPN["VPN Access<br/>Remote Connections"]
            SSL_TLS["SSL/TLS Encryption<br/>HTTPS/WSS"]
        end
        
        subgraph Authentication["Authentication & Authorization"]
            OAuth["OAuth 2.0<br/>Token-based Auth"]
            RBAC["Role-Based Access Control<br/>PM/Developer/Analyst"]
            JWT["JWT Tokens<br/>Stateless Sessions"]
        end
        
        subgraph Data_Security["Data Protection"]
            Encryption_Rest["Encryption at Rest<br/>Database Encryption"]
            Encryption_Transit["Encryption in Transit<br/>TLS 1.3"]
            Sensitive_Data["Sensitive Data Masking<br/>Classified Info Protection"]
        end
        
        subgraph API_Security["API Security"]
            Rate_Limiting["Rate Limiting<br/>API Throttling"]
            Input_Validation["Input Validation<br/>Schema Validation"]
            CORS["CORS Policy<br/>Cross-Origin Control"]
        end
    end

    subgraph Services["Protected Services"]
        PM_Dashboard_Sec["PM Dashboard<br/>Authentication Required"]
        Ontology_Mgr_Sec["Ontology Manager<br/>Role-based Access"]
        Knowledge_Sec["Knowledge Service<br/>Data Classification"]
        Task_Orch_Sec["Task Orchestrator<br/>Workflow Security"]
    end

    %% Security Layer Connections
    Network_Security --> Authentication
    Authentication --> Data_Security
    Data_Security --> API_Security
    API_Security --> Services

    %% Detailed Connections
    Firewall --> PM_Dashboard_Sec
    OAuth --> Ontology_Mgr_Sec
    Encryption_Rest --> Knowledge_Sec
    Rate_Limiting --> Task_Orch_Sec

    %% Styling
    classDef securityStyle fill:#ffebee,stroke:#c62828,stroke-width:2px
    classDef serviceStyle fill:#e8f5e8,stroke:#1b5e20,stroke-width:2px

    class Firewall,VPN,SSL_TLS,OAuth,RBAC,JWT,Encryption_Rest,Encryption_Transit,Sensitive_Data,Rate_Limiting,Input_Validation,CORS securityStyle
    class PM_Dashboard_Sec,Ontology_Mgr_Sec,Knowledge_Sec,Task_Orch_Sec serviceStyle
```

## 📈 Performance & Scalability Architecture

### Response Time Targets
- **Persona Response**: < 30 seconds per task
- **Ontology Extraction**: < 3 minutes per standard document
- **Semantic Alignment**: < 2 minutes for 1,000 concepts
- **Code Generation**: < 1 minute for complete pipeline
- **UI Updates**: < 500ms for dashboard refresh

### Scalability Design
- **Horizontal Scaling**: Stateless services with load balancing
- **Caching Strategy**: Redis for frequently accessed ontologies
- **Database Optimization**: Indexed queries and connection pooling
- **Vector Search**: Qdrant clustering for large-scale similarity search
- **Memory Management**: Ontology caching with LRU eviction

### Resource Allocation
- **CPU**: 4-8 cores per service instance
- **Memory**: 4-8GB per service (16GB for Ontology Manager)
- **Storage**: SSD storage for databases, network storage for artifacts
- **Network**: Gigabit ethernet for inter-service communication

---

**This architecture provides a robust, scalable foundation for demonstrating revolutionary semantic interoperability capabilities through AI-driven ontology integration! 🏗️🚀**
