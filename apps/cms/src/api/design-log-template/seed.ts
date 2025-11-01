import type { Core } from '@strapi/strapi';

const templates = [
  {
    slug: 'p-04-design-log',
    title: 'P-04 Design Log Template',
    description: 'Design log template for P-04: User Research & Empathy',
    courseCode: 'P-04',
    order: 1,
    version: '1.0.0',
    sections: [
      {
        id: 'user-research',
        title: 'User Research',
        description: 'Document your user research findings and insights',
        fields: [
          {
            name: 'research-methods',
            label: 'Research Methods Used',
            type: 'text',
            placeholder: 'Interviews, surveys, observations...',
          },
          {
            name: 'key-findings',
            label: 'Key Findings',
            type: 'richtext',
            placeholder: 'What did you discover about your users?',
          },
          {
            name: 'user-needs',
            label: 'User Needs Identified',
            type: 'list',
            placeholder: 'List the primary needs of your users',
          },
        ],
      },
      {
        id: 'empathy-mapping',
        title: 'Empathy Mapping',
        description: 'Build empathy with your target users',
        fields: [
          {
            name: 'user-persona',
            label: 'User Persona',
            type: 'richtext',
            placeholder: 'Describe your target user persona',
          },
          {
            name: 'pain-points',
            label: 'Pain Points',
            type: 'list',
            placeholder: 'What challenges do users face?',
          },
          {
            name: 'goals',
            label: 'User Goals',
            type: 'list',
            placeholder: 'What are users trying to achieve?',
          },
        ],
      },
      {
        id: 'insights',
        title: 'Key Insights',
        description: 'Synthesize your research into actionable insights',
        fields: [
          {
            name: 'insights',
            label: 'Design Insights',
            type: 'richtext',
            placeholder: 'What insights will guide your design?',
          },
        ],
      },
    ],
    defaultTimelineMilestones: [
      {
        id: 'research-planning',
        title: 'Research Planning',
        description: 'Define research objectives and methods',
        estimatedDuration: '2 days',
      },
      {
        id: 'data-collection',
        title: 'Data Collection',
        description: 'Conduct interviews, surveys, and observations',
        estimatedDuration: '5 days',
      },
      {
        id: 'analysis',
        title: 'Analysis & Synthesis',
        description: 'Analyze data and create empathy maps',
        estimatedDuration: '3 days',
      },
      {
        id: 'insights',
        title: 'Insight Generation',
        description: 'Synthesize findings into design insights',
        estimatedDuration: '2 days',
      },
    ],
    exampleDecisions: [
      {
        title: 'Choosing Research Methods',
        description: 'Selected qualitative interviews over surveys to gain deeper user insights',
        rationale: 'Interviews allow for follow-up questions and richer contextual understanding',
        outcome: 'Uncovered unexpected pain points that surveys would have missed',
      },
      {
        title: 'Target User Selection',
        description: 'Narrowed focus to early-career professionals rather than all age groups',
        rationale: 'Initial research showed this group had the most pressing needs',
        outcome: 'More focused insights and clearer design direction',
      },
    ],
    helpTips: `
      <h3>Getting Started with User Research</h3>
      <p>Focus on understanding your users deeply before jumping into solutions. Remember:</p>
      <ul>
        <li>Ask "why" multiple times to uncover root causes</li>
        <li>Observe behavior, not just what users say</li>
        <li>Look for patterns across multiple users</li>
        <li>Stay curious and avoid making assumptions</li>
      </ul>
      <h3>Common Pitfalls</h3>
      <ul>
        <li>Confirmation bias: seeking data that confirms your ideas</li>
        <li>Leading questions: asking questions that suggest answers</li>
        <li>Too small sample size: not enough diversity in research</li>
      </ul>
    `,
  },
  {
    slug: 'p-05-design-log',
    title: 'P-05 Design Log Template',
    description: 'Design log template for P-05: Ideation & Prototyping',
    courseCode: 'P-05',
    order: 2,
    version: '1.0.0',
    sections: [
      {
        id: 'ideation',
        title: 'Ideation',
        description: 'Explore and generate multiple solution ideas',
        fields: [
          {
            name: 'brainstorm-methods',
            label: 'Ideation Methods',
            type: 'text',
            placeholder: 'Sketching, mind mapping, SCAMPER...',
          },
          {
            name: 'ideas-generated',
            label: 'Number of Ideas Generated',
            type: 'number',
            placeholder: '20+',
          },
          {
            name: 'top-concepts',
            label: 'Top 3-5 Concepts',
            type: 'richtext',
            placeholder: 'Describe your most promising ideas',
          },
        ],
      },
      {
        id: 'concept-selection',
        title: 'Concept Selection',
        description: 'Evaluate and select ideas to prototype',
        fields: [
          {
            name: 'selection-criteria',
            label: 'Selection Criteria',
            type: 'list',
            placeholder: 'Feasibility, user impact, innovation...',
          },
          {
            name: 'chosen-concept',
            label: 'Chosen Concept',
            type: 'richtext',
            placeholder: 'Which concept did you choose and why?',
          },
        ],
      },
      {
        id: 'prototyping',
        title: 'Prototyping',
        description: 'Build low to medium fidelity prototypes',
        fields: [
          {
            name: 'prototype-type',
            label: 'Prototype Type',
            type: 'text',
            placeholder: 'Paper prototype, digital mockup, physical model...',
          },
          {
            name: 'prototype-description',
            label: 'Prototype Description',
            type: 'richtext',
            placeholder: 'What does your prototype demonstrate?',
          },
          {
            name: 'iterations',
            label: 'Iteration Notes',
            type: 'richtext',
            placeholder: 'How did your prototype evolve?',
          },
        ],
      },
    ],
    defaultTimelineMilestones: [
      {
        id: 'divergent-ideation',
        title: 'Divergent Ideation',
        description: 'Generate many diverse ideas without judgment',
        estimatedDuration: '2 days',
      },
      {
        id: 'convergent-selection',
        title: 'Convergent Selection',
        description: 'Evaluate and select the most promising concepts',
        estimatedDuration: '1 day',
      },
      {
        id: 'low-fi-prototyping',
        title: 'Low-Fidelity Prototyping',
        description: 'Create quick, rough prototypes to test ideas',
        estimatedDuration: '3 days',
      },
      {
        id: 'prototype-iteration',
        title: 'Prototype Iteration',
        description: 'Refine prototypes based on feedback',
        estimatedDuration: '4 days',
      },
    ],
    exampleDecisions: [
      {
        title: 'Paper vs Digital Prototype',
        description: 'Chose paper prototyping for initial concept testing',
        rationale: 'Faster to create and iterate, easier for users to provide honest feedback',
        outcome: 'Received valuable feedback early and made 3 significant changes before going digital',
      },
      {
        title: 'Breadth vs Depth in Ideation',
        description: 'Generated 50+ ideas before narrowing down',
        rationale: 'More ideas increase chances of finding novel solutions',
        outcome: 'Found unexpected combination of ideas that became the final concept',
      },
    ],
    helpTips: `
      <h3>Effective Ideation Strategies</h3>
      <p>Generate quantity first, then focus on quality:</p>
      <ul>
        <li>Set a goal for number of ideas (aim for 20-50+)</li>
        <li>Use "Yes, and..." thinking to build on ideas</li>
        <li>Combine ideas in unexpected ways</li>
        <li>Don't judge ideas during brainstorming</li>
      </ul>
      <h3>Prototyping Best Practices</h3>
      <ul>
        <li>Start with low fidelity - speed over polish</li>
        <li>Test assumptions early and often</li>
        <li>Create multiple versions to compare</li>
        <li>Focus on core functionality first</li>
      </ul>
    `,
  },
  {
    slug: 'p-06-design-log',
    title: 'P-06 Design Log Template',
    description: 'Design log template for P-06: Testing & Iteration',
    courseCode: 'P-06',
    order: 3,
    version: '1.0.0',
    sections: [
      {
        id: 'testing-plan',
        title: 'Testing Plan',
        description: 'Plan your user testing approach',
        fields: [
          {
            name: 'testing-objectives',
            label: 'Testing Objectives',
            type: 'list',
            placeholder: 'What questions do you want to answer?',
          },
          {
            name: 'testing-methods',
            label: 'Testing Methods',
            type: 'text',
            placeholder: 'Usability testing, A/B testing, focus groups...',
          },
          {
            name: 'participants',
            label: 'Number of Participants',
            type: 'number',
            placeholder: '5-8 users recommended',
          },
        ],
      },
      {
        id: 'testing-results',
        title: 'Testing Results',
        description: 'Document findings from user testing',
        fields: [
          {
            name: 'observations',
            label: 'Key Observations',
            type: 'richtext',
            placeholder: 'What did you observe during testing?',
          },
          {
            name: 'user-feedback',
            label: 'User Feedback',
            type: 'richtext',
            placeholder: 'What did users say about the prototype?',
          },
          {
            name: 'success-metrics',
            label: 'Success Metrics',
            type: 'richtext',
            placeholder: 'How did users perform on key tasks?',
          },
        ],
      },
      {
        id: 'iteration-plan',
        title: 'Iteration Plan',
        description: 'Plan improvements based on testing',
        fields: [
          {
            name: 'issues-identified',
            label: 'Issues Identified',
            type: 'list',
            placeholder: 'List usability issues and problems',
          },
          {
            name: 'proposed-changes',
            label: 'Proposed Changes',
            type: 'richtext',
            placeholder: 'How will you address the issues?',
          },
          {
            name: 'priority',
            label: 'Priority Ranking',
            type: 'richtext',
            placeholder: 'Which changes are most critical?',
          },
        ],
      },
      {
        id: 'final-design',
        title: 'Final Design',
        description: 'Document your final design solution',
        fields: [
          {
            name: 'design-description',
            label: 'Final Design Description',
            type: 'richtext',
            placeholder: 'Describe your final design solution',
          },
          {
            name: 'key-features',
            label: 'Key Features',
            type: 'list',
            placeholder: 'List the main features of your solution',
          },
          {
            name: 'impact',
            label: 'Expected Impact',
            type: 'richtext',
            placeholder: 'How will this design help users?',
          },
        ],
      },
    ],
    defaultTimelineMilestones: [
      {
        id: 'test-preparation',
        title: 'Test Preparation',
        description: 'Prepare testing materials and recruit participants',
        estimatedDuration: '2 days',
      },
      {
        id: 'user-testing',
        title: 'User Testing Sessions',
        description: 'Conduct testing with 5-8 users',
        estimatedDuration: '3 days',
      },
      {
        id: 'analysis',
        title: 'Analysis & Synthesis',
        description: 'Analyze feedback and identify patterns',
        estimatedDuration: '2 days',
      },
      {
        id: 'iteration',
        title: 'Design Iteration',
        description: 'Implement improvements based on feedback',
        estimatedDuration: '3 days',
      },
      {
        id: 'final-refinement',
        title: 'Final Refinement',
        description: 'Polish and finalize the design',
        estimatedDuration: '2 days',
      },
    ],
    exampleDecisions: [
      {
        title: 'Testing Sample Size',
        description: 'Tested with 6 users across 2 rounds',
        rationale: '5 users typically uncover 85% of usability issues; did 2 rounds to validate changes',
        outcome: 'First round found major issues, second round confirmed fixes worked',
      },
      {
        title: 'Prioritizing Feedback',
        description: 'Focused on critical usability issues over feature requests',
        rationale: 'Users must be able to complete core tasks before adding features',
        outcome: 'Improved task success rate from 60% to 95%',
      },
      {
        title: 'Iteration Scope',
        description: 'Made 3 small iterations instead of 1 large redesign',
        rationale: 'Smaller changes are easier to test and validate',
        outcome: 'Each iteration showed measurable improvement in user performance',
      },
    ],
    helpTips: `
      <h3>Conducting Effective User Tests</h3>
      <p>Testing is about learning, not proving you're right:</p>
      <ul>
        <li>Give users specific tasks to complete</li>
        <li>Observe silently and take detailed notes</li>
        <li>Ask users to think aloud as they work</li>
        <li>Wait for users to struggle before helping</li>
        <li>Follow up with clarifying questions</li>
      </ul>
      <h3>Analyzing Test Results</h3>
      <ul>
        <li>Look for patterns across multiple users</li>
        <li>Distinguish between critical issues and preferences</li>
        <li>Quantify success rates for key tasks</li>
        <li>Consider both what users say and what they do</li>
      </ul>
      <h3>Iterating Effectively</h3>
      <ul>
        <li>Focus on the most critical issues first</li>
        <li>Make one change at a time when possible</li>
        <li>Test changes before moving to the next iteration</li>
        <li>Document what worked and what didn't</li>
      </ul>
    `,
  },
];

export async function seedDesignLogTemplates(strapi: Core.Strapi) {
  try {
    strapi.log.info('Checking for design log templates...');

    const service = strapi.service('api::design-log-template.design-log-template');

    for (const template of templates) {
      const existing = await service.getBySlug(template.slug);

      if (!existing) {
        strapi.log.info(`Seeding template: ${template.slug}`);
        await service.upsertTemplate({
          ...template,
          publishedAt: new Date(),
        });
        strapi.log.info(`✓ Template seeded: ${template.slug}`);
      } else {
        strapi.log.info(`Template already exists: ${template.slug}`);
      }
    }

    strapi.log.info('Design log template seeding completed');
  } catch (error) {
    strapi.log.error('Error seeding design log templates:', error);
  }
}
