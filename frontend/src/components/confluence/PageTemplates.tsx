import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  FileText, 
  Users, 
  Calendar, 
  Cog, 
  BookOpen, 
  ClipboardList,
  MessageSquare,
  Target
} from 'lucide-react';

export interface PageTemplate {
  id: string;
  name: string;
  description: string;
  type: 'documentation' | 'process' | 'meeting_notes' | 'feature';
  icon: React.ReactNode;
  content: string;
  tags: string[];
}

const templates: PageTemplate[] = [
  {
    id: 'project-overview',
    name: 'Project Overview',
    description: 'Document project goals, scope, and key information',
    type: 'documentation',
    icon: <BookOpen className="w-5 h-5" />,
    content: `# Project Overview

## Project Summary
[Brief description of the project]

## Goals and Objectives
- Primary goal: [Main objective]
- Secondary goals:
  - [Secondary objective 1]
  - [Secondary objective 2]

## Project Scope
### In Scope
- [Feature/requirement 1]
- [Feature/requirement 2]

### Out of Scope
- [Item 1]
- [Item 2]

## Key Stakeholders
- **Project Manager:** [Name]
- **Technical Lead:** [Name]
- **Product Owner:** [Name]
- **Development Team:** [Names]

## Timeline
- **Start Date:** [Date]
- **End Date:** [Date]
- **Key Milestones:**
  - [Milestone 1] - [Date]
  - [Milestone 2] - [Date]

## Resources
- **Budget:** [Amount]
- **Team Size:** [Number] developers
- **Tools:** [List of tools and technologies]

## Success Criteria
- [Criteria 1]
- [Criteria 2]
- [Criteria 3]

## Risks and Mitigation
| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| [Risk 1] | High/Medium/Low | High/Medium/Low | [Mitigation strategy] |
| [Risk 2] | High/Medium/Low | High/Medium/Low | [Mitigation strategy] |`,
    tags: ['project', 'overview', 'planning']
  },
  {
    id: 'meeting-notes',
    name: 'Meeting Notes',
    description: 'Standard template for recording meeting discussions',
    type: 'meeting_notes',
    icon: <Calendar className="w-5 h-5" />,
    content: `# Meeting Notes

## Meeting Details
- **Date:** [Date]
- **Time:** [Time]
- **Duration:** [Duration]
- **Meeting Type:** [Daily Standup/Sprint Planning/Review/etc.]
- **Location:** [Physical/Virtual location]

## Attendees
- [Name] - [Role]
- [Name] - [Role]
- [Name] - [Role]

## Agenda
1. [Agenda item 1]
2. [Agenda item 2]
3. [Agenda item 3]

## Discussion Points
### [Topic 1]
- [Discussion point]
- [Key insight]
- [Decision made]

### [Topic 2]
- [Discussion point]
- [Key insight]
- [Decision made]

## Action Items
| Action | Owner | Due Date | Status |
|--------|--------|----------|--------|
| [Action 1] | [Name] | [Date] | Not Started |
| [Action 2] | [Name] | [Date] | In Progress |

## Decisions Made
- [Decision 1] - [Reasoning]
- [Decision 2] - [Reasoning]

## Next Steps
- [Next step 1]
- [Next step 2]

## Next Meeting
- **Date:** [Date]
- **Time:** [Time]
- **Agenda:** [Brief agenda for next meeting]`,
    tags: ['meeting', 'notes', 'discussion']
  },
  {
    id: 'technical-design',
    name: 'Technical Design Document',
    description: 'Template for technical architecture and design decisions',
    type: 'documentation',
    icon: <Cog className="w-5 h-5" />,
    content: `# Technical Design Document

## Overview
[Brief description of the feature/system being designed]

## Background
[Context and motivation for this design]

## Goals and Non-Goals
### Goals
- [Goal 1]
- [Goal 2]

### Non-Goals
- [Non-goal 1]
- [Non-goal 2]

## System Architecture
[High-level system architecture description]

### Components
- **Component 1:** [Description]
- **Component 2:** [Description]
- **Component 3:** [Description]

### Data Flow
1. [Step 1 description]
2. [Step 2 description]
3. [Step 3 description]

## Detailed Design
### API Design
\`\`\`
// Example API endpoints
GET /api/resource
POST /api/resource
PUT /api/resource/:id
DELETE /api/resource/:id
\`\`\`

### Database Schema
\`\`\`sql
-- Example table structure
CREATE TABLE example_table (
  id INTEGER PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
\`\`\`

### Security Considerations
- [Security consideration 1]
- [Security consideration 2]

## Performance Considerations
- [Performance consideration 1]
- [Performance consideration 2]

## Testing Strategy
- **Unit Tests:** [Description]
- **Integration Tests:** [Description]
- **End-to-End Tests:** [Description]

## Deployment Strategy
- [Deployment step 1]
- [Deployment step 2]

## Monitoring and Logging
- [Monitoring requirement 1]
- [Logging requirement 2]

## Alternatives Considered
### Alternative 1
- **Pros:** [Advantages]
- **Cons:** [Disadvantages]
- **Decision:** [Why not chosen]

### Alternative 2
- **Pros:** [Advantages]
- **Cons:** [Disadvantages]
- **Decision:** [Why not chosen]

## Timeline
- **Design Review:** [Date]
- **Implementation Start:** [Date]
- **Testing:** [Date]
- **Deployment:** [Date]`,
    tags: ['technical', 'design', 'architecture']
  },
  {
    id: 'feature-requirements',
    name: 'Feature Requirements',
    description: 'Document detailed requirements for a new feature',
    type: 'feature',
    icon: <Target className="w-5 h-5" />,
    content: `# Feature Requirements

## Feature Overview
[Brief description of the feature]

## User Story
**As a** [type of user]
**I want** [some goal]
**So that** [some reason/benefit]

## Acceptance Criteria
- [ ] [Criteria 1]
- [ ] [Criteria 2]
- [ ] [Criteria 3]

## Functional Requirements
### FR-1: [Requirement Title]
**Description:** [Detailed description]
**Priority:** High/Medium/Low
**Acceptance Criteria:**
- [Criteria 1]
- [Criteria 2]

### FR-2: [Requirement Title]
**Description:** [Detailed description]
**Priority:** High/Medium/Low
**Acceptance Criteria:**
- [Criteria 1]
- [Criteria 2]

## Non-Functional Requirements
### Performance
- [Performance requirement 1]
- [Performance requirement 2]

### Security
- [Security requirement 1]
- [Security requirement 2]

### Usability
- [Usability requirement 1]
- [Usability requirement 2]

## User Interface Requirements
### Wireframes
[Link to wireframes or description]

### User Flow
1. [Step 1]
2. [Step 2]
3. [Step 3]

## Business Rules
- [Business rule 1]
- [Business rule 2]

## Dependencies
- [Dependency 1]
- [Dependency 2]

## Assumptions
- [Assumption 1]
- [Assumption 2]

## Constraints
- [Constraint 1]
- [Constraint 2]

## Success Metrics
- [Metric 1]: [Target value]
- [Metric 2]: [Target value]

## Testing Requirements
- [Testing requirement 1]
- [Testing requirement 2]

## Documentation Requirements
- [Documentation requirement 1]
- [Documentation requirement 2]`,
    tags: ['feature', 'requirements', 'specification']
  },
  {
    id: 'process-documentation',
    name: 'Process Documentation',
    description: 'Document team processes and procedures',
    type: 'process',
    icon: <ClipboardList className="w-5 h-5" />,
    content: `# Process Documentation

## Process Overview
[Brief description of the process]

## Purpose
[Why this process exists and its benefits]

## Scope
[What is covered by this process]

## Roles and Responsibilities
- **[Role 1]:** [Responsibilities]
- **[Role 2]:** [Responsibilities]
- **[Role 3]:** [Responsibilities]

## Prerequisites
- [Prerequisite 1]
- [Prerequisite 2]

## Process Steps
### Step 1: [Step Name]
**Responsible:** [Role]
**Duration:** [Time estimate]
**Description:** [Detailed description]
**Inputs:** [Required inputs]
**Outputs:** [Expected outputs]
**Tools:** [Tools needed]

### Step 2: [Step Name]
**Responsible:** [Role]
**Duration:** [Time estimate]
**Description:** [Detailed description]
**Inputs:** [Required inputs]
**Outputs:** [Expected outputs]
**Tools:** [Tools needed]

### Step 3: [Step Name]
**Responsible:** [Role]
**Duration:** [Time estimate]
**Description:** [Detailed description]
**Inputs:** [Required inputs]
**Outputs:** [Expected outputs]
**Tools:** [Tools needed]

## Decision Points
### Decision Point 1
**Question:** [Decision to be made]
**Criteria:** [Decision criteria]
**Options:**
- **Option A:** [Description] → Go to Step X
- **Option B:** [Description] → Go to Step Y

## Quality Checkpoints
- [Checkpoint 1]: [Quality criteria]
- [Checkpoint 2]: [Quality criteria]

## Common Issues and Solutions
| Issue | Cause | Solution |
|-------|-------|----------|
| [Issue 1] | [Cause] | [Solution] |
| [Issue 2] | [Cause] | [Solution] |

## Metrics and KPIs
- [Metric 1]: [Target/Benchmark]
- [Metric 2]: [Target/Benchmark]

## Tools and Resources
- [Tool 1]: [Description and link]
- [Tool 2]: [Description and link]

## Training Requirements
- [Training requirement 1]
- [Training requirement 2]

## Review and Updates
- **Review Frequency:** [How often]
- **Review Owner:** [Role responsible]
- **Last Updated:** [Date]
- **Next Review:** [Date]

## Related Processes
- [Related process 1]
- [Related process 2]`,
    tags: ['process', 'procedure', 'workflow']
  },
  {
    id: 'retrospective',
    name: 'Sprint Retrospective',
    description: 'Template for sprint retrospective meetings',
    type: 'meeting_notes',
    icon: <MessageSquare className="w-5 h-5" />,
    content: `# Sprint Retrospective

## Sprint Information
- **Sprint:** [Sprint number/name]
- **Date:** [Date]
- **Duration:** [Sprint duration]
- **Team:** [Team name]

## Attendees
- [Name] - [Role]
- [Name] - [Role]
- [Name] - [Role]

## Sprint Summary
### Sprint Goal
[What was the sprint goal?]

### Sprint Completion
- **Planned Points:** [Number]
- **Completed Points:** [Number]
- **Completion Rate:** [Percentage]

### Major Achievements
- [Achievement 1]
- [Achievement 2]
- [Achievement 3]

## What Went Well? 👍
- [Positive item 1]
- [Positive item 2]
- [Positive item 3]

## What Could Be Improved? 🤔
- [Improvement area 1]
- [Improvement area 2]
- [Improvement area 3]

## What Didn't Go Well? 👎
- [Problem 1]
- [Problem 2]
- [Problem 3]

## Root Cause Analysis
### Issue: [Issue name]
**Description:** [Detailed description]
**Root Cause:** [Identified root cause]
**Impact:** [Impact on the team/project]

### Issue: [Issue name]
**Description:** [Detailed description]
**Root Cause:** [Identified root cause]
**Impact:** [Impact on the team/project]

## Action Items
| Action | Owner | Due Date | Priority | Status |
|--------|--------|----------|----------|--------|
| [Action 1] | [Name] | [Date] | High/Medium/Low | Open |
| [Action 2] | [Name] | [Date] | High/Medium/Low | Open |
| [Action 3] | [Name] | [Date] | High/Medium/Low | Open |

## Experiment Ideas
- [Experiment 1]: [Description of what to try]
- [Experiment 2]: [Description of what to try]

## Team Health Check
**Overall Team Mood:** [1-5 scale] ⭐⭐⭐⭐⭐
**Communication:** [1-5 scale] ⭐⭐⭐⭐⭐
**Collaboration:** [1-5 scale] ⭐⭐⭐⭐⭐
**Work-Life Balance:** [1-5 scale] ⭐⭐⭐⭐⭐

## Metrics
- **Velocity:** [Current] (Previous: [Previous])
- **Bug Count:** [Current] (Previous: [Previous])
- **Customer Satisfaction:** [Score] (Previous: [Previous])

## Appreciation
### Shout-outs
- [Name]: [What they did well]
- [Name]: [What they did well]

## Next Sprint Focus
- [Focus area 1]
- [Focus area 2]
- [Focus area 3]

## Follow-up
- **Next Retrospective:** [Date]
- **Action Items Review:** [Date]`,
    tags: ['retrospective', 'agile', 'team', 'improvement']
  }
];

interface PageTemplatesSelectorProps {
  onSelectTemplate: (template: PageTemplate) => void;
  onClose: () => void;
}

export const PageTemplatesSelector: React.FC<PageTemplatesSelectorProps> = ({
  onSelectTemplate,
  onClose
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', name: 'All Templates', icon: <FileText className="w-4 h-4" /> },
    { id: 'documentation', name: 'Documentation', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'feature', name: 'Features', icon: <Target className="w-4 h-4" /> },
    { id: 'process', name: 'Processes', icon: <ClipboardList className="w-4 h-4" /> },
    { id: 'meeting_notes', name: 'Meetings', icon: <Calendar className="w-4 h-4" /> }
  ];

  const filteredTemplates = selectedCategory === 'all' 
    ? templates 
    : templates.filter(template => template.type === selectedCategory);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Choose a Template</h2>
        <Button variant="outline" onClick={onClose}>
          Start from Scratch
        </Button>
      </div>

      {/* Category Filter */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category.id)}
            className="whitespace-nowrap"
          >
            {category.icon}
            <span className="ml-2">{category.name}</span>
          </Button>
        ))}
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.map((template) => (
          <Card 
            key={template.id}
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onSelectTemplate(template)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  {template.icon}
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {template.type.replace('_', ' ')}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-3">{template.description}</p>
              <div className="flex flex-wrap gap-1">
                {template.tags.slice(0, 3).map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {template.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{template.tags.length - 3} more
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-8">
          <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
          <p className="text-gray-500">
            Try selecting a different category or start from scratch.
          </p>
        </div>
      )}
    </div>
  );
};

export { templates };
