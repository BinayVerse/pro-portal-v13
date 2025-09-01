<template>
  <div v-if="solution">
    <section class="pt-16 pb-24 px-4 sm:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto">
        <!-- Filter Tabs -->
        <div class="flex flex-wrap justify-center gap-2 mb-12">
          <button
            v-for="industry in allIndustries"
            :key="industry.slug"
            class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            :class="
              industry.slug === slug
                ? 'bg-primary-500 text-white'
                : 'bg-dark-800 text-gray-300 hover:bg-dark-700 hover:text-white'
            "
            @click="navigateTo(`/solutions/${industry.slug}`)"
          >
            {{ industry.name }}
          </button>
        </div>

        <!-- Main Content Grid -->
        <div class="grid lg:grid-cols-12 gap-8 mb-20">
          <!-- Left Sidebar -->
          <div class="lg:col-span-4">
            <div class="bg-dark-800 rounded-xl p-6 border border-dark-700">
              <div class="flex items-center space-x-3 mb-6">
                <div
                  class="w-12 h-12 bg-primary-500/20 rounded-lg flex items-center justify-center"
                >
                  <UIcon :name="solution.icon" class="w-6 h-6 text-primary-400" />
                </div>
                <h1 class="text-2xl font-bold text-white">{{ solution.name }}</h1>
              </div>

              <p class="text-gray-300 mb-6">{{ solution.description }}</p>

              <div class="space-y-3 mb-6">
                <div v-for="point in solution.keyPoints" :key="point" class="flex items-start">
                  <div class="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span class="text-gray-300 text-sm">{{ point }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Content -->
          <div class="lg:col-span-8">
            <!-- How Provento.ai Helps -->
            <div class="bg-dark-800 rounded-xl p-8 border border-dark-700">
              <h2 class="text-2xl font-bold text-white mb-6">How Provento.ai Helps</h2>
              <div class="space-y-4">
                <div v-for="help in solution.helps" :key="help" class="flex items-center space-x-3">
                  <div
                    class="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0"
                  >
                    <UIcon name="i-heroicons-check" class="w-4 h-4 text-white" />
                  </div>
                  <span class="text-gray-300">{{ help }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Common Use Cases - Full Width Section -->
        <div class="mb-20">
          <h2 class="text-2xl font-bold text-white text-center mb-8">Common Use Cases</h2>
          <div class="grid md:grid-cols-3 gap-6">
            <div
              v-for="useCase in solution.useCases"
              :key="useCase.title"
              class="bg-dark-800 rounded-xl p-6 border border-dark-700"
            >
              <div
                class="w-12 h-12 bg-primary-500/20 rounded-lg flex items-center justify-center mb-4"
              >
                <UIcon name="i-heroicons-document-text" class="w-6 h-6 text-primary-400" />
              </div>
              <h3 class="text-lg font-semibold text-white mb-3">{{ useCase.title }}</h3>
              <p class="text-gray-300 text-sm mb-4">{{ useCase.description }}</p>
              <p class="text-primary-400 text-sm font-medium">{{ useCase.question }}</p>
            </div>
          </div>
        </div>

        <!-- Key Features -->
        <div class="mb-20">
          <h2 class="text-2xl font-bold text-white text-center mb-8">
            Key Features for {{ solution.name }}
          </h2>
          <div class="grid md:grid-cols-2 gap-6">
            <div
              v-for="feature in solution.keyFeatures"
              :key="feature.title"
              class="bg-dark-800 rounded-xl p-6 border border-dark-700"
            >
              <div class="flex items-start space-x-4">
                <div
                  class="w-12 h-12 bg-primary-500/20 rounded-lg flex items-center justify-center flex-shrink-0"
                >
                  <UIcon :name="feature.icon" class="w-6 h-6 text-primary-400" />
                </div>
                <div>
                  <h3 class="text-lg font-semibold text-white mb-2">{{ feature.title }}</h3>
                  <p class="text-gray-300 text-sm">{{ feature.description }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- CTA Section -->
        <div
          class="text-center bg-gradient-to-r from-primary-900/20 to-primary-800/20 rounded-xl p-8"
        >
          <h2 class="text-3xl font-bold text-white mb-4">
            Ready to Transform Your {{ solution.name }} Workflow?
          </h2>
          <p class="text-xl text-gray-300 mb-8">
            See how Provento.ai can streamline your {{ solution.name.toLowerCase() }} artefact
            processes.
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <NuxtLink to="/book-meeting" class="btn-primary text-lg px-8 py-4">
              Book a Demo
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>
  </div>
  <div v-else class="min-h-screen flex items-center justify-center">
    <div class="text-center">
      <h1 class="text-4xl font-bold text-white mb-4">Solution Not Found</h1>
      <p class="text-gray-300 mb-4">The solution "{{ slug }}" doesn't exist.</p>
      <p class="text-gray-400 mb-8 text-sm">
        Available solutions: {{ Object.keys(solutions).join(', ') }}
      </p>
      <NuxtLink to="/solutions" class="btn-primary"> Back to Solutions </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
// Using default layout

const route = useRoute()
const slug = route.params.slug as string

const allIndustries = [
  { name: 'Education', slug: 'education' },
  { name: 'Finance & Banking', slug: 'finance-banking' },
  { name: 'Government', slug: 'government' },
  { name: 'Healthcare', slug: 'healthcare' },
  { name: 'Insurance', slug: 'insurance' },
  { name: 'Legal', slug: 'legal' },
  { name: 'Manufacturing', slug: 'manufacturing' },
  { name: 'Real Estate', slug: 'real-estate' },
]

const solutions: Record<string, any> = {
  education: {
    name: 'Education',
    description:
      'Enhance learning experiences and administrative efficiency with intelligent artefact management for educational institutions.',
    icon: 'i-heroicons-academic-cap',
    keyPoints: [
      'Time-consuming manual artefact review',
      'Difficulty finding relevant case precedents',
      'Complex contract analysis requirements',
      'Regulatory compliance tracking',
    ],
    helps: [
      'Instant case law and precedent search',
      'Automated contract clause analysis',
      'Regulatory compliance monitoring',
      'Legal research acceleration',
    ],
    useCases: [
      {
        title: 'Curriculum Management',
        description:
          'Organize and search through course materials, syllabi, and educational resources.',
        question: 'Ask: "Find all materials related to quantum physics in advanced courses"',
      },
      {
        title: 'Research Support',
        description:
          'Help students and faculty quickly find relevant research papers and citations.',
        question: 'Ask: "What are the key findings about climate change in recent studies?"',
      },
      {
        title: 'Student Services',
        description: 'Quickly access student records, policies, and procedural information.',
        question: 'Ask: "What are the requirements for graduate program admission?"',
      },
    ],
    testimonial: {
      quote:
        'Our faculty can now instantly access relevant research materials and course content. Student services has become much more efficient with quick policy lookups.',
      author: 'Dr. Michael Chen',
      title: 'Dean of Academic Affairs, State University',
    },
    stats: [
      { value: '60%', label: 'Research Time Saved' },
      { value: '85%', label: 'Student Queries Resolved' },
      { value: '95%', label: 'Faculty Satisfaction' },
    ],
    keyFeatures: [
      {
        title: 'Academic Content Search',
        description:
          'Search across syllabi, lecture notes, research papers, and academic databases with intelligent content recognition.',
        icon: 'i-heroicons-magnifying-glass',
      },
      {
        title: 'Citation Management',
        description:
          'Automatically format and verify academic citations across different style guides like APA, MLA, and Chicago.',
        icon: 'i-heroicons-document-text',
      },
      {
        title: 'Plagiarism Detection',
        description:
          'Identify potential plagiarism and citation issues in student submissions and research papers.',
        icon: 'i-heroicons-check-circle',
      },
      {
        title: 'Learning Analytics',
        description:
          'Track artefact usage patterns to understand learning preferences and improve curriculum design.',
        icon: 'i-heroicons-chart-bar',
      },
    ],
  },
  'finance-banking': {
    name: 'Finance & Banking',
    description:
      'Transform financial research, contract analysis, and case preparation with AI-powered artefact intelligence. Quickly find relevant precedents, analyze contracts, and extract key legal insights.',
    icon: 'i-heroicons-currency-dollar',
    keyPoints: [
      'Complex financial artefact analysis',
      'Risk assessment requirements',
      'Regulatory compliance challenges',
      'Credit and loan processing',
    ],
    helps: [
      'Automated financial artefact analysis',
      'Risk assessment acceleration',
      'Compliance monitoring',
      'Credit decision support',
    ],
    useCases: [
      {
        title: 'Credit Analysis',
        description:
          'Quickly analyze financial statements, credit reports, and supporting artefacts.',
        question: 'Ask: "What are the key financial ratios in this loan application?"',
      },
      {
        title: 'Risk Assessment',
        description: 'Identify potential risks and compliance issues in financial artefacts.',
        question: 'Ask: "Find any red flags related to data privacy violations in healthcare"',
      },
      {
        title: 'Regulatory Compliance',
        description: 'Ensure all financial products meet current regulatory requirements.',
        question: 'Ask: "What are the intellectual property risks in these artefacts?"',
      },
    ],
    testimonial: {
      quote:
        'Our credit review process has been revolutionized. What used to take days now takes hours, and we catch more potential issues than ever before.',
      author: 'Michael Rodriguez',
      title: 'Risk Manager, First National Bank',
    },
    stats: [
      { value: '65%', label: 'Analysis Time Reduced' },
      { value: '88%', label: 'Risk Detection Rate' },
      { value: '96%', label: 'Compliance Accuracy' },
    ],
    keyFeatures: [
      {
        title: 'Financial Intelligence',
        description:
          'Extract and analyze key financial metrics, ratios, and risk indicators with AI-powered analysis.',
        icon: 'i-heroicons-document-text',
      },
      {
        title: 'Risk Assessment',
        description:
          'Automatically identify and categorize financial risks from artefact analysis.',
        icon: 'i-heroicons-magnifying-glass',
      },
      {
        title: 'Regulatory Compliance',
        description:
          'Ensure artefacts meet current financial regulations and compliance standards.',
        icon: 'i-heroicons-check-circle',
      },
      {
        title: 'Artefact Classification',
        description: 'Automatically categorize and tag financial artefacts by type and importance.',
        icon: 'i-heroicons-folder',
      },
    ],
  },
  government: {
    name: 'Government',
    description:
      'Modernize public sector artefact management and citizen services with intelligent artefact processing for policy artefacts, public records, and regulatory compliance.',
    icon: 'i-heroicons-building-office',
    keyPoints: [
      'Complex policy artefact management',
      'Public records accessibility',
      'Regulatory compliance tracking',
      'Inter-department coordination',
    ],
    helps: [
      'Policy artefact organization',
      'Public record search capabilities',
      'Compliance automation',
      'Citizen service enhancement',
    ],
    useCases: [
      {
        title: 'Policy Research',
        description:
          'Quickly search through policy artefacts, regulations, and historical records.',
        question: 'Ask: "Find all policies related to environmental regulations from 2020-2023"',
      },
      {
        title: 'Public Records',
        description: 'Efficiently locate and analyze public records for citizen requests.',
        question: 'Ask: "What building permits were issued in downtown district last year?"',
      },
      {
        title: 'Compliance Monitoring',
        description: 'Ensure department activities comply with current regulations and policies.',
        question: 'Ask: "Check compliance status for all environmental impact assessments"',
      },
    ],
    testimonial: {
      quote:
        'Our policy research and public records management has been transformed. Citizens get faster responses and our staff can focus on higher-value activities.',
      author: 'Jennifer Walsh',
      title: 'Director of Public Services, City Administration',
    },
    stats: [
      { value: '55%', label: 'Response Time Reduced' },
      { value: '90%', label: 'Records Accuracy' },
      { value: '85%', label: 'Citizen Satisfaction' },
    ],
    keyFeatures: [
      {
        title: 'Policy Intelligence',
        description:
          'Search and analyze complex policy artefacts with intelligent content understanding.',
        icon: 'heroicons:document-text',
      },
      {
        title: 'Records Management',
        description:
          'Organize and search public records with advanced indexing and categorization.',
        icon: 'heroicons:magnifying-glass',
      },
      {
        title: 'Compliance Tracking',
        description: 'Monitor and ensure adherence to government regulations and policies.',
        icon: 'heroicons:check-circle',
      },
      {
        title: 'Citizen Services',
        description:
          'Enhance citizen services with faster artefact processing and information retrieval.',
        icon: 'heroicons:funnel',
      },
    ],
  },
  insurance: {
    name: 'Insurance',
    description:
      'Streamline claims processing and risk assessment workflows with intelligent artefact analysis for faster, more accurate insurance operations.',
    icon: 'heroicons:shield-check',
    keyPoints: [
      'Complex claims processing workflows',
      'Risk assessment documentation',
      'Policy analysis requirements',
      'Fraud detection challenges',
    ],
    helps: [
      'Automated claims processing',
      'Risk assessment acceleration',
      'Policy analysis automation',
      'Fraud detection enhancement',
    ],
    useCases: [
      {
        title: 'Claims Processing',
        description:
          'Automatically extract and analyze information from claims artefacts and supporting materials.',
        question: 'Ask: "What are the key details from this auto accident claim?"',
      },
      {
        title: 'Risk Assessment',
        description: 'Analyze applications and supporting artefacts to assess risk factors.',
        question: 'Ask: "Identify risk factors in this property insurance application"',
      },
      {
        title: 'Policy Analysis',
        description: 'Review policy artefacts for coverage details and exclusions.',
        question: 'Ask: "What coverage exclusions apply to this water damage claim?"',
      },
    ],
    testimonial: {
      quote:
        'Our claims processing speed has increased dramatically while maintaining accuracy. Our customers are much happier with faster claim resolutions.',
      author: 'Robert Chen',
      title: 'Claims Director, Liberty Insurance Group',
    },
    stats: [
      { value: '68%', label: 'Processing Time Reduced' },
      { value: '94%', label: 'Accuracy Rate' },
      { value: '89%', label: 'Customer Satisfaction' },
    ],
    keyFeatures: [
      {
        title: 'Claims Intelligence',
        description:
          'Extract key information from claims artefacts with intelligent artefact processing.',
        icon: 'heroicons:document-text',
      },
      {
        title: 'Risk Analysis',
        description:
          'Automatically assess risk factors from application artefacts and supporting materials.',
        icon: 'heroicons:magnifying-glass',
      },
      {
        title: 'Fraud Detection',
        description:
          'Identify potential fraud indicators through artefact analysis and pattern recognition.',
        icon: 'heroicons:check-circle',
      },
      {
        title: 'Policy Management',
        description: 'Organize and search policy artefacts with intelligent categorization.',
        icon: 'heroicons:funnel',
      },
    ],
  },
  legal: {
    name: 'Legal',
    description:
      'Transform legal research, contract analysis, and case preparation with AI-powered artefact intelligence. Quickly find relevant precedents, analyze contracts, and extract key legal insights.',
    icon: 'heroicons:scale',
    keyPoints: [
      'Time-consuming manual artefact review',
      'Difficulty finding relevant case precedents',
      'Complex contract analysis requirements',
      'Regulatory compliance tracking',
    ],
    helps: [
      'Instant case law and precedent search',
      'Automated contract clause analysis',
      'Regulatory compliance monitoring',
      'Legal research acceleration',
    ],
    useCases: [
      {
        title: 'Contract Analysis',
        description: 'Quickly identify key clauses, obligations, and potential risks in contracts.',
        question: 'Ask: "What are the termination clauses in this agreement?"',
      },
      {
        title: 'Legal Research',
        description: 'Find relevant case law, statutes, and legal precedents instantly.',
        question:
          'Ask: "Find cases similar to intellectual property disputes in technology sector"',
      },
      {
        title: 'Due Diligence',
        description: 'Accelerate due diligence processes with comprehensive artefact analysis.',
        question: 'Ask: "What are the intellectual property risks in these artefacts?"',
      },
    ],
    testimonial: {
      quote:
        'Our contract review process has been revolutionized. What used to take days now takes hours, and we catch more potential issues than ever before.',
      author: 'Sarah Williams',
      title: 'Partner, Morrison & Associates Law Firm',
    },
    stats: [
      { value: '70%', label: 'Review Time Reduced' },
      { value: '92%', label: 'Issue Detection Rate' },
      { value: '98%', label: 'Client Satisfaction' },
    ],
    keyFeatures: [
      {
        title: 'Contract Intelligence',
        description:
          'Extract and analyze key contract terms, obligations, and potential risks with AI-powered legal analysis.',
        icon: 'heroicons:document-text',
      },
      {
        title: 'Legal Precedent Search',
        description:
          'Find relevant case law and legal precedents from vast legal databases and case libraries.',
        icon: 'heroicons:magnifying-glass',
      },
      {
        title: 'Compliance Monitoring',
        description:
          'Ensure artefacts meet current legal standards and regulatory requirements across jurisdictions.',
        icon: 'heroicons:check-circle',
      },
      {
        title: 'Artefact Classification',
        description:
          'Automatically categorize and tag legal artefacts by type, jurisdiction, and practice area.',
        icon: 'heroicons:funnel',
      },
    ],
  },
  manufacturing: {
    name: 'Manufacturing',
    description:
      'Optimize technical documentation and quality processes with intelligent artefact management for manufacturing operations and compliance.',
    icon: 'heroicons:building-office-2',
    keyPoints: [
      'Complex technical documentation',
      'Quality control processes',
      'Compliance requirements',
      'Process optimization needs',
    ],
    helps: [
      'Technical artefact organization',
      'Quality process automation',
      'Compliance monitoring',
      'Process optimization insights',
    ],
    useCases: [
      {
        title: 'Technical Specifications',
        description:
          'Quickly search and analyze technical specifications and engineering artefacts.',
        question: 'Ask: "Find all specifications for steel grade requirements in automotive parts"',
      },
      {
        title: 'Quality Documentation',
        description: 'Organize and search quality control artefacts and inspection records.',
        question: 'Ask: "What are the quality standards for this product line?"',
      },
      {
        title: 'Process Manuals',
        description: 'Access and analyze process documentation for operational efficiency.',
        question: 'Ask: "Find safety procedures for handling hazardous materials in production"',
      },
    ],
    testimonial: {
      quote:
        'Our technical documentation is now easily searchable and our quality processes are much more efficient. Compliance audits are no longer a headache.',
      author: 'David Kumar',
      title: 'Quality Manager, Precision Manufacturing Inc.',
    },
    stats: [
      { value: '50%', label: 'Documentation Access Time' },
      { value: '85%', label: 'Process Efficiency' },
      { value: '95%', label: 'Compliance Rate' },
    ],
    keyFeatures: [
      {
        title: 'Technical Intelligence',
        description:
          'Search and analyze complex technical specifications with intelligent artefact processing.',
        icon: 'heroicons:document-text',
      },
      {
        title: 'Quality Management',
        description: 'Organize and track quality control artefacts and inspection records.',
        icon: 'heroicons:magnifying-glass',
      },
      {
        title: 'Process Optimization',
        description: 'Analyze process documentation to identify optimization opportunities.',
        icon: 'heroicons:check-circle',
      },
      {
        title: 'Compliance Tracking',
        description: 'Monitor and ensure compliance with manufacturing standards and regulations.',
        icon: 'heroicons:funnel',
      },
    ],
  },
  'real-estate': {
    name: 'Real Estate',
    description:
      'Simplify property documentation and transaction management with intelligent artefact processing for contracts, leases, and market analysis.',
    icon: 'heroicons:home',
    keyPoints: [
      'Complex property documentation',
      'Contract and lease management',
      'Market analysis requirements',
      'Due diligence processes',
    ],
    helps: [
      'Property artefact organization',
      'Contract analysis automation',
      'Market data insights',
      'Due diligence acceleration',
    ],
    useCases: [
      {
        title: 'Property artefacts',
        description: 'Organize and search property artefacts, deeds, and ownership records.',
        question: 'Ask: "Find all property artefacts for 123 Main Street including deed history"',
      },
      {
        title: 'Contracts & Leases',
        description: 'Analyze purchase agreements, leases, and rental contracts for key terms.',
        question: 'Ask: "What are the key terms in this commercial lease agreement?"',
      },
      {
        title: 'Market Analysis',
        description: 'Review market reports and comparative analyses for investment decisions.',
        question: 'Ask: "What are the market trends for commercial properties in downtown?"',
      },
    ],
    testimonial: {
      quote:
        'Our property transaction process is now much faster and more accurate. We can quickly analyze contracts and identify potential issues before they become problems.',
      author: 'Lisa Thompson',
      title: 'Senior Broker, Metropolitan Realty Group',
    },
    stats: [
      { value: '45%', label: 'Transaction Time Reduced' },
      { value: '88%', label: 'Artefact Accuracy' },
      { value: '92%', label: 'Client Satisfaction' },
    ],
    keyFeatures: [
      {
        title: 'Property Intelligence',
        description: 'Search and analyze property artefacts with intelligent content recognition.',
        icon: 'heroicons:document-text',
      },
      {
        title: 'Contract Analysis',
        description: 'Automatically extract and analyze key terms from contracts and leases.',
        icon: 'heroicons:magnifying-glass',
      },
      {
        title: 'Market Insights',
        description: 'Analyze market data and reports for informed investment decisions.',
        icon: 'heroicons:check-circle',
      },
      {
        title: 'Due Diligence',
        description: 'Streamline due diligence processes with comprehensive artefact analysis.',
        icon: 'heroicons:funnel',
      },
    ],
  },
  healthcare: {
    name: 'Healthcare',
    description:
      'Improve patient care with intelligent medical artefact analysis for research studies, treatment protocols, and patient documentation.',
    icon: 'heroicons:heart',
    keyPoints: [
      'Complex medical documentation',
      'Research data management',
      'Treatment protocol organization',
      'Patient record accessibility',
    ],
    helps: [
      'Medical artefact organization',
      'Research data insights',
      'Protocol standardization',
      'Patient care enhancement',
    ],
    useCases: [
      {
        title: 'Medical Records',
        description: 'Quickly search and analyze patient medical records and history.',
        question: 'Ask: "Find all patients with similar symptoms to hypertension in the last year"',
      },
      {
        title: 'Research Studies',
        description: 'Organize and analyze medical research studies and clinical trial data.',
        question: 'Ask: "What are the latest findings on diabetes treatment protocols?"',
      },
      {
        title: 'Treatment Protocols',
        description: 'Access and compare treatment protocols for specific conditions.',
        question: 'Ask: "What is the standard treatment protocol for cardiac surgery patients?"',
      },
    ],
    testimonial: {
      quote:
        'Our medical research capabilities have been enhanced significantly. We can now quickly access relevant studies and patient data to improve treatment outcomes.',
      author: 'Dr. Rachel Martinez',
      title: 'Chief of Medicine, General Hospital',
    },
    stats: [
      { value: '58%', label: 'Research Time Saved' },
      { value: '91%', label: 'Data Accuracy' },
      { value: '94%', label: 'Care Quality Score' },
    ],
    keyFeatures: [
      {
        title: 'Medical Intelligence',
        description: 'Search and analyze medical artefacts with healthcare-specific understanding.',
        icon: 'heroicons:document-text',
      },
      {
        title: 'Research Support',
        description: 'Organize and analyze medical research studies and clinical trial data.',
        icon: 'heroicons:magnifying-glass',
      },
      {
        title: 'Protocol Management',
        description: 'Access and compare treatment protocols with intelligent categorization.',
        icon: 'heroicons:check-circle',
      },
      {
        title: 'Patient Care',
        description: 'Enhance patient care with quick access to relevant medical information.',
        icon: 'heroicons:funnel',
      },
    ],
  },
}

const solution = computed(() => solutions[slug] || null)

useHead({
  title: solution.value
    ? `${solution.value.name} Solutions - Provento.ai`
    : 'Solution Not Found - Provento.ai',
})
</script>
