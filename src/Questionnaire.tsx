import React, { useState } from 'react';
import './Questionnaire.css';
import Logo from './Logo';

interface QuestionnaireProps {
  onComplete: (answers: any) => void;
  onSkip: () => void;
}

// Comprehensive list of countries
const countries = [
  { value: 'af', label: '🇦🇫 Afghanistan' },
  { value: 'al', label: '🇦🇱 Albania' },
  { value: 'dz', label: '🇩🇿 Algeria' },
  { value: 'ad', label: '🇦🇩 Andorra' },
  { value: 'ao', label: '🇦🇴 Angola' },
  { value: 'ag', label: '🇦🇬 Antigua and Barbuda' },
  { value: 'ar', label: '🇦🇷 Argentina' },
  { value: 'am', label: '🇦🇲 Armenia' },
  { value: 'au', label: '🇦🇺 Australia' },
  { value: 'at', label: '🇦🇹 Austria' },
  { value: 'az', label: '🇦🇿 Azerbaijan' },
  { value: 'bs', label: '🇧🇸 Bahamas' },
  { value: 'bh', label: '🇧🇭 Bahrain' },
  { value: 'bd', label: '🇧🇩 Bangladesh' },
  { value: 'bb', label: '🇧🇧 Barbados' },
  { value: 'by', label: '🇧🇾 Belarus' },
  { value: 'be', label: '🇧🇪 Belgium' },
  { value: 'bz', label: '🇧🇿 Belize' },
  { value: 'bj', label: '🇧🇯 Benin' },
  { value: 'bt', label: '🇧🇹 Bhutan' },
  { value: 'bo', label: '🇧🇴 Bolivia' },
  { value: 'ba', label: '🇧🇦 Bosnia and Herzegovina' },
  { value: 'bw', label: '🇧🇼 Botswana' },
  { value: 'br', label: '🇧🇷 Brazil' },
  { value: 'bn', label: '🇧🇳 Brunei' },
  { value: 'bg', label: '🇧🇬 Bulgaria' },
  { value: 'bf', label: '🇧🇫 Burkina Faso' },
  { value: 'bi', label: '🇧🇮 Burundi' },
  { value: 'cv', label: '🇨🇻 Cape Verde' },
  { value: 'kh', label: '🇰🇭 Cambodia' },
  { value: 'cm', label: '🇨🇲 Cameroon' },
  { value: 'ca', label: '🇨🇦 Canada' },
  { value: 'cf', label: '🇨🇫 Central African Republic' },
  { value: 'td', label: '🇹🇩 Chad' },
  { value: 'cl', label: '🇨🇱 Chile' },
  { value: 'cn', label: '🇨🇳 China' },
  { value: 'co', label: '🇨🇴 Colombia' },
  { value: 'km', label: '🇰🇲 Comoros' },
  { value: 'cg', label: '🇨🇬 Congo' },
  { value: 'cd', label: '🇨🇩 Congo (Democratic Republic)' },
  { value: 'cr', label: '🇨🇷 Costa Rica' },
  { value: 'ci', label: '🇨🇮 Côte d\'Ivoire' },
  { value: 'hr', label: '🇭🇷 Croatia' },
  { value: 'cu', label: '🇨🇺 Cuba' },
  { value: 'cy', label: '🇨🇾 Cyprus' },
  { value: 'cz', label: '🇨🇿 Czech Republic' },
  { value: 'dk', label: '🇩🇰 Denmark' },
  { value: 'dj', label: '🇩🇯 Djibouti' },
  { value: 'dm', label: '🇩🇲 Dominica' },
  { value: 'do', label: '🇩🇴 Dominican Republic' },
  { value: 'ec', label: '🇪🇨 Ecuador' },
  { value: 'eg', label: '🇪🇬 Egypt' },
  { value: 'sv', label: '🇸🇻 El Salvador' },
  { value: 'gq', label: '🇬🇶 Equatorial Guinea' },
  { value: 'er', label: '🇪🇷 Eritrea' },
  { value: 'ee', label: '🇪🇪 Estonia' },
  { value: 'sz', label: '🇸🇿 Eswatini' },
  { value: 'et', label: '🇪🇹 Ethiopia' },
  { value: 'fj', label: '🇫🇯 Fiji' },
  { value: 'fi', label: '🇫🇮 Finland' },
  { value: 'fr', label: '🇫🇷 France' },
  { value: 'ga', label: '🇬🇦 Gabon' },
  { value: 'gm', label: '🇬🇲 Gambia' },
  { value: 'ge', label: '🇬🇪 Georgia' },
  { value: 'de', label: '🇩🇪 Germany' },
  { value: 'gh', label: '🇬🇭 Ghana' },
  { value: 'gr', label: '🇬🇷 Greece' },
  { value: 'gd', label: '🇬🇩 Grenada' },
  { value: 'gt', label: '🇬🇹 Guatemala' },
  { value: 'gn', label: '🇬🇳 Guinea' },
  { value: 'gw', label: '🇬🇼 Guinea-Bissau' },
  { value: 'gy', label: '🇬🇾 Guyana' },
  { value: 'ht', label: '🇭🇹 Haiti' },
  { value: 'hn', label: '🇭🇳 Honduras' },
  { value: 'hu', label: '🇭🇺 Hungary' },
  { value: 'is', label: '🇮🇸 Iceland' },
  { value: 'in', label: '🇮🇳 India' },
  { value: 'id', label: '🇮🇩 Indonesia' },
  { value: 'ir', label: '🇮🇷 Iran' },
  { value: 'iq', label: '🇮🇶 Iraq' },
  { value: 'ie', label: '🇮🇪 Ireland' },
  { value: 'il', label: '🇮🇱 Israel' },
  { value: 'it', label: '🇮🇹 Italy' },
  { value: 'jm', label: '🇯🇲 Jamaica' },
  { value: 'jp', label: '🇯🇵 Japan' },
  { value: 'jo', label: '🇯🇴 Jordan' },
  { value: 'kz', label: '🇰🇿 Kazakhstan' },
  { value: 'ke', label: '🇰🇪 Kenya' },
  { value: 'ki', label: '🇰🇮 Kiribati' },
  { value: 'kp', label: '🇰🇵 Korea (North)' },
  { value: 'kr', label: '🇰🇷 Korea (South)' },
  { value: 'kw', label: '🇰🇼 Kuwait' },
  { value: 'kg', label: '🇰🇬 Kyrgyzstan' },
  { value: 'la', label: '🇱🇦 Laos' },
  { value: 'lv', label: '🇱🇻 Latvia' },
  { value: 'lb', label: '🇱🇧 Lebanon' },
  { value: 'ls', label: '🇱🇸 Lesotho' },
  { value: 'lr', label: '🇱🇷 Liberia' },
  { value: 'ly', label: '🇱🇾 Libya' },
  { value: 'li', label: '🇱🇮 Liechtenstein' },
  { value: 'lt', label: '🇱🇹 Lithuania' },
  { value: 'lu', label: '🇱🇺 Luxembourg' },
  { value: 'mg', label: '🇲🇬 Madagascar' },
  { value: 'mw', label: '🇲🇼 Malawi' },
  { value: 'my', label: '🇲🇾 Malaysia' },
  { value: 'mv', label: '🇲🇻 Maldives' },
  { value: 'ml', label: '🇲🇱 Mali' },
  { value: 'mt', label: '🇲🇹 Malta' },
  { value: 'mh', label: '🇲🇭 Marshall Islands' },
  { value: 'mr', label: '🇲🇷 Mauritania' },
  { value: 'mu', label: '🇲🇺 Mauritius' },
  { value: 'mx', label: '🇲🇽 Mexico' },
  { value: 'fm', label: '🇫🇲 Micronesia' },
  { value: 'md', label: '🇲🇩 Moldova' },
  { value: 'mc', label: '🇲🇨 Monaco' },
  { value: 'mn', label: '🇲🇳 Mongolia' },
  { value: 'me', label: '🇲🇪 Montenegro' },
  { value: 'ma', label: '🇲🇦 Morocco' },
  { value: 'mz', label: '🇲🇿 Mozambique' },
  { value: 'mm', label: '🇲🇲 Myanmar' },
  { value: 'na', label: '🇳🇦 Namibia' },
  { value: 'nr', label: '🇳🇷 Nauru' },
  { value: 'np', label: '🇳🇵 Nepal' },
  { value: 'nl', label: '🇳🇱 Netherlands' },
  { value: 'nz', label: '🇳🇿 New Zealand' },
  { value: 'ni', label: '🇳🇮 Nicaragua' },
  { value: 'ne', label: '🇳🇪 Niger' },
  { value: 'ng', label: '🇳🇬 Nigeria' },
  { value: 'mk', label: '🇲🇰 North Macedonia' },
  { value: 'no', label: '🇳🇴 Norway' },
  { value: 'om', label: '🇴🇲 Oman' },
  { value: 'pk', label: '🇵🇰 Pakistan' },
  { value: 'pw', label: '🇵🇼 Palau' },
  { value: 'ps', label: '🇵🇸 Palestine' },
  { value: 'pa', label: '🇵🇦 Panama' },
  { value: 'pg', label: '🇵🇬 Papua New Guinea' },
  { value: 'py', label: '🇵🇾 Paraguay' },
  { value: 'pe', label: '🇵🇪 Peru' },
  { value: 'ph', label: '🇵🇭 Philippines' },
  { value: 'pl', label: '🇵🇱 Poland' },
  { value: 'pt', label: '🇵🇹 Portugal' },
  { value: 'qa', label: '🇶🇦 Qatar' },
  { value: 'ro', label: '🇷🇴 Romania' },
  { value: 'ru', label: '🇷🇺 Russia' },
  { value: 'rw', label: '🇷🇼 Rwanda' },
  { value: 'kn', label: '🇰🇳 Saint Kitts and Nevis' },
  { value: 'lc', label: '🇱🇨 Saint Lucia' },
  { value: 'vc', label: '🇻🇨 Saint Vincent and the Grenadines' },
  { value: 'ws', label: '🇼🇸 Samoa' },
  { value: 'sm', label: '🇸🇲 San Marino' },
  { value: 'st', label: '🇸🇹 São Tomé and Príncipe' },
  { value: 'sa', label: '🇸🇦 Saudi Arabia' },
  { value: 'sn', label: '🇸🇳 Senegal' },
  { value: 'rs', label: '🇷🇸 Serbia' },
  { value: 'sc', label: '🇸🇨 Seychelles' },
  { value: 'sl', label: '🇸🇱 Sierra Leone' },
  { value: 'sg', label: '🇸🇬 Singapore' },
  { value: 'sk', label: '🇸🇰 Slovakia' },
  { value: 'si', label: '🇸🇮 Slovenia' },
  { value: 'sb', label: '🇸🇧 Solomon Islands' },
  { value: 'so', label: '🇸🇴 Somalia' },
  { value: 'za', label: '🇿🇦 South Africa' },
  { value: 'ss', label: '🇸🇸 South Sudan' },
  { value: 'es', label: '🇪🇸 Spain' },
  { value: 'lk', label: '🇱🇰 Sri Lanka' },
  { value: 'sd', label: '🇸🇩 Sudan' },
  { value: 'sr', label: '🇸🇷 Suriname' },
  { value: 'se', label: '🇸🇪 Sweden' },
  { value: 'ch', label: '🇨🇭 Switzerland' },
  { value: 'sy', label: '🇸🇾 Syria' },
  { value: 'tw', label: '🇹🇼 Taiwan' },
  { value: 'tj', label: '🇹🇯 Tajikistan' },
  { value: 'tz', label: '🇹🇿 Tanzania' },
  { value: 'th', label: '🇹🇭 Thailand' },
  { value: 'tl', label: '🇹🇱 Timor-Leste' },
  { value: 'tg', label: '🇹🇬 Togo' },
  { value: 'to', label: '🇹🇴 Tonga' },
  { value: 'tt', label: '🇹🇹 Trinidad and Tobago' },
  { value: 'tn', label: '🇹🇳 Tunisia' },
  { value: 'tr', label: '🇹🇷 Turkey' },
  { value: 'tm', label: '🇹🇲 Turkmenistan' },
  { value: 'tv', label: '🇹🇻 Tuvalu' },
  { value: 'ug', label: '🇺🇬 Uganda' },
  { value: 'ua', label: '🇺🇦 Ukraine' },
  { value: 'ae', label: '🇦🇪 United Arab Emirates' },
  { value: 'gb', label: '🇬🇧 United Kingdom' },
  { value: 'us', label: '🇺🇸 United States' },
  { value: 'uy', label: '🇺🇾 Uruguay' },
  { value: 'uz', label: '🇺🇿 Uzbekistan' },
  { value: 'vu', label: '🇻🇺 Vanuatu' },
  { value: 'va', label: '🇻🇦 Vatican City' },
  { value: 've', label: '🇻🇪 Venezuela' },
  { value: 'vn', label: '🇻🇳 Vietnam' },
  { value: 'ye', label: '🇾🇪 Yemen' },
  { value: 'zm', label: '🇿🇲 Zambia' },
  { value: 'zw', label: '🇿🇼 Zimbabwe' },
];

const Questionnaire: React.FC<QuestionnaireProps> = ({ onComplete, onSkip }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: any }>({});

  // Define your questionnaire structure here with personal demographics first
  const questions = [
    // PERSONAL DEMOGRAPHICS SECTION
    {
      id: 'q0_age',
      title: 'What is your age?',
      type: 'single-select' as const,
      required: true,
      options: [
        { value: '18-24', label: '18-24 years old' },
        { value: '25-34', label: '25-34 years old' },
        { value: '35-44', label: '35-44 years old' },
        { value: '45-54', label: '45-54 years old' },
        { value: '55-64', label: '55-64 years old' },
        { value: '65+', label: '65+ years old' },
      ],
    },
    {
      id: 'q0_gender',
      title: 'How do you identify?',
      type: 'single-select' as const,
      required: true,
      options: [
        { value: 'male', label: 'Male' },
        { value: 'female', label: 'Female' },
        { value: 'non-binary', label: 'Non-binary' },
        { value: 'prefer-not-to-say', label: 'Prefer not to say' },
        { value: 'other', label: 'Other' },
      ],
    },
    {
      id: 'q0_nationality',
      title: 'What is your nationality?',
      type: 'dropdown' as const,
      required: true,
      options: countries,
    },
    {
      id: 'q0_country_residence',
      title: 'Which country do you currently live in?',
      type: 'dropdown' as const,
      required: true,
      options: countries,
    },
    {
      id: 'q0_marital_status',
      title: 'What is your current relationship status?',
      type: 'single-select' as const,
      required: true,
      options: [
        { value: 'single', label: '💙 Single' },
        { value: 'in-relationship', label: '💕 In a relationship' },
        { value: 'married', label: '💍 Married' },
        { value: 'divorced', label: '📋 Divorced' },
        { value: 'widowed', label: '🕊️ Widowed' },
        { value: 'prefer-not-to-say', label: '🤐 Prefer not to say' },
      ],
    },
    {
      id: 'q0_children',
      title: 'Do you have children or dependents?',
      type: 'single-select' as const,
      required: true,
      options: [
        { value: 'no-children', label: '🚫 No children' },
        { value: 'young-children', label: '👶 Young children (0-12)' },
        { value: 'teenagers', label: '🧒 Teenagers (13-18)' },
        { value: 'adult-children', label: '👨‍👩‍👧‍👦 Adult children' },
        { value: 'elderly-dependents', label: '👴👵 Elderly dependents' },
        { value: 'multiple-dependents', label: '👨‍👩‍👧‍👦 Multiple dependents' },
      ],
    },
    {
      id: 'q0_occupation',
      title: 'What best describes your current work situation?',
      type: 'single-select' as const,
      required: true,
      options: [
        { value: 'full-time-employee', label: '💼 Full-time employee' },
        { value: 'part-time-employee', label: '⏰ Part-time employee' },
        { value: 'self-employed', label: '🏢 Self-employed/Freelancer' },
        { value: 'business-owner', label: '👔 Business owner' },
        { value: 'student', label: '📚 Student' },
        { value: 'retired', label: '🏖️ Retired' },
        { value: 'unemployed', label: '🔍 Currently unemployed' },
        { value: 'homemaker', label: '🏠 Homemaker/Stay-at-home parent' },
        { value: 'other', label: '🤷 Other' },
      ],
    },
    {
      id: 'q0_work_stress',
      title: 'How would you rate your current work/life stress level?',
      type: 'slider' as const,
      required: true,
      min: 1,
      max: 10,
      labels: {
        1: 'Very low stress',
        3: 'Manageable stress',
        5: 'Moderate stress',
        7: 'High stress',
        10: 'Overwhelming stress',
      },
    },
    {
      id: 'q0_income_comfort',
      title: 'How would you describe your current financial situation?',
      type: 'single-select' as const,
      required: true,
      options: [
        { value: 'very-comfortable', label: '💰 Very comfortable - no financial worries' },
        { value: 'comfortable', label: '😌 Comfortable - can afford most things I want' },
        { value: 'getting-by', label: '⚖️ Getting by - can cover basic needs' },
        { value: 'tight', label: '😰 Tight - struggling to make ends meet' },
        { value: 'very-difficult', label: '😟 Very difficult - constant financial stress' },
        { value: 'prefer-not-to-say', label: '🤐 Prefer not to say' },
      ],
    },
    {
      id: 'q0_living_situation',
      title: 'What is your current living situation?',
      type: 'single-select' as const,
      required: true,
      options: [
        { value: 'alone', label: '🏠 Live alone' },
        { value: 'with-partner', label: '💑 Live with partner/spouse' },
        { value: 'with-family', label: '👨‍👩‍👧‍👦 Live with family' },
        { value: 'with-roommates', label: '🏡 Live with roommates/friends' },
        { value: 'with-parents', label: '👨‍👩‍👧 Live with parents' },
        { value: 'other', label: '🏘️ Other living arrangement' },
      ],
    },
    {
      id: 'q0_health_status',
      title: 'How would you rate your overall physical health?',
      type: 'slider' as const,
      required: true,
      min: 1,
      max: 10,
      labels: {
        1: 'Poor health',
        3: 'Below average',
        5: 'Average health',
        7: 'Good health',
        10: 'Excellent health',
      },
    },
    {
      id: 'q0_sleep_quality',
      title: 'How would you rate your typical sleep quality?',
      type: 'slider' as const,
      required: true,
      min: 1,
      max: 10,
      labels: {
        1: 'Very poor sleep',
        3: 'Poor sleep',
        5: 'Average sleep',
        7: 'Good sleep',
        10: 'Excellent sleep',
      },
    },
    {
      id: 'q0_daily_challenges',
      title: 'What are your biggest daily life challenges? (Select all that apply)',
      type: 'multi-select' as const,
      required: true,
      options: [
        { value: 'work-pressure', label: '💼 Work pressure and deadlines' },
        { value: 'financial-stress', label: '💰 Financial concerns' },
        { value: 'relationship-issues', label: '💔 Relationship challenges' },
        { value: 'health-concerns', label: '🏥 Health issues' },
        { value: 'parenting-stress', label: '👶 Parenting responsibilities' },
        { value: 'time-management', label: '⏰ Time management' },
        { value: 'social-isolation', label: '😔 Loneliness or social isolation' },
        { value: 'technology-overwhelm', label: '📱 Technology/information overwhelm' },
        { value: 'life-transitions', label: '🔄 Major life changes or transitions' },
        { value: 'self-doubt', label: '🤔 Self-doubt and confidence issues' },
        { value: 'physical-pain', label: '😣 Chronic pain or physical discomfort' },
        { value: 'other', label: '🤷 Other challenges' },
      ],
    },
    // MIND AND HAPPINESS QUESTIONS
    {
      id: 'q1_motivation',
      title: 'Welcome to your mindfulness journey! What brings you to the Return of Attention app today?',
      type: 'multi-select' as const,
      required: true,
      options: [
        { value: 'reduce_stress', label: '😌 Reduce stress and anxiety' },
        { value: 'improve_focus', label: '🎯 Improve focus and concentration' },
        { value: 'better_sleep', label: '😴 Better sleep quality' },
        { value: 'build_resilience', label: '💪 Build mental resilience' },
        { value: 'personal_growth', label: '🌱 Personal growth and self-awareness' },
        { value: 'support_mental_health', label: '🏥 Support mental health treatment' },
        { value: 'explore_consciousness', label: '📚 Explore consciousness and attention training' },
        { value: 'lasting_happiness', label: '✨ To cultivate lasting inner peace and happiness' },
        { value: 'learn_meditation', label: '🧘 Learn meditation and mindfulness' },
      ],
    },
    {
      id: 'q2_experience_level',
      title: 'How would you describe your experience with meditation or mindfulness practices?',
      type: 'slider' as const,
      required: true,
      min: 1,
      max: 10,
      labels: {
        1: 'Complete beginner, never tried',
        3: 'Curious but minimal experience',
        5: 'Some experience, inconsistent practice',
        7: 'Regular practitioner, established routine',
        9: 'Advanced practitioner, deep experience',
      },
    },
    {
      id: 'q3_time_commitment',
      title: 'Realistically, how much time can you dedicate to Return of Attention practice on most days?',
      type: 'single-select' as const,
      required: true,
      options: [
        { value: '5-10_min', label: '5-10 minutes (Beginner friendly)' },
        { value: '10-20_min', label: '10-20 minutes (Building consistency)' },
        { value: '20-30_min', label: '20-30 minutes (Committed practice)' },
        { value: '30+_min', label: '30+ minutes (Intensive development)' },
        { value: 'varies', label: 'Varies day to day (Flexible approach)' },
      ],
    },
    {
      id: 'q4_learning_style',
      title: 'How do you prefer to learn new skills?',
      type: 'multi-select' as const,
      required: true,
      options: [
        { value: 'reading', label: '📖 Reading detailed instructions' },
        { value: 'listening', label: '🎧 Listening to guided audio' },
        { value: 'watching', label: '👀 Watching demonstrations' },
        { value: 'hands_on', label: '🤲 Hands-on practice and experimentation' },
        { value: 'community', label: '👥 Learning with others/community' },
        { value: 'tracking', label: '📊 Tracking progress with data' },
        { value: 'creative', label: '🎨 Creative and visual approaches' },
      ],
    },
    {
      id: 'q5_motivation_patterns',
      title: 'What typically motivates you to stick with new habits? Rank these from most to least important:',
      type: 'ranking' as const,
      required: true,
      options: [
        { value: 'measurable_progress', label: 'Seeing measurable progress' },
        { value: 'immediate_benefits', label: 'Feeling immediate benefits' },
        { value: 'social_support', label: 'Social support and community' },
        { value: 'personal_challenges', label: 'Personal challenges and goals' },
        { value: 'routine_consistency', label: 'Routine and consistency' },
        { value: 'variety_new_experiences', label: 'Variety and new experiences' },
        { value: 'understanding_science', label: 'Understanding the science behind it' },
      ],
    },
    {
      id: 'q6_coping_mechanisms',
      title: 'When faced with daily challenges or setbacks, what strategies do you typically use to maintain your emotional balance?',
      type: 'multi-select' as const,
      required: true,
      options: [
        { value: 'mindfulness_meditation', label: '🧘 Mindfulness/meditation' },
        { value: 'talking_friends_family', label: '🗣️ Talking to friends/family' },
        { value: 'exercise', label: '🏃 Exercise' },
        { value: 'distraction', label: '📺 Distraction (e.g., TV, games)' },
        { value: 'journaling', label: '✍️ Journaling' },
      ],
    },
    {
      id: 'q7_lasting_happiness_definition',
      title: 'When you think of \'happiness that stays,\' what does that mean to you?',
      type: 'multi-select' as const,
      required: true,
      options: [
        { value: 'consistent_inner_peace', label: '☮️ Consistent inner peace' },
        { value: 'resilience_ups_downs', label: '💪 Resilience to life\'s ups and downs' },
        { value: 'deep_contentment', label: '😌 A deep sense of contentment' },
        { value: 'bounce_back_negativity', label: '⬆️ Ability to bounce back from negativity' },
        { value: 'emotional_stability', label: '⚖️ Emotional stability' },
      ],
    },
  ];

  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers((prevAnswers) => ({
      ...prevAnswers,
      [questionId]: value,
    }));
  };

  // Function to check if current question is answered
  const isCurrentQuestionAnswered = () => {
    const currentQuestion = questions[currentQuestionIndex];
    const currentAnswer = answers[currentQuestion.id];

    switch (currentQuestion.type) {
      case 'dropdown':
      case 'single-select':
        return currentAnswer && currentAnswer !== '';
      case 'multi-select':
        return currentAnswer && Array.isArray(currentAnswer) && currentAnswer.length > 0;
      case 'slider':
        return currentAnswer !== undefined && currentAnswer !== null;
      case 'ranking':
        return currentAnswer && Array.isArray(currentAnswer) && currentAnswer.length > 0;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (!isCurrentQuestionAnswered()) {
      return; // Don't proceed if question is not answered
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      onComplete(answers);
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const currentQuestion = questions[currentQuestionIndex];

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, dropIndex: number) => {
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData('text/plain'));
    const currentRanking = answers[currentQuestion.id] ? [...answers[currentQuestion.id]] : [...(currentQuestion.options || [])];

    const [draggedItem] = currentRanking.splice(dragIndex, 1);
    currentRanking.splice(dropIndex, 0, draggedItem);

    handleAnswerChange(currentQuestion.id, currentRanking);
  };

  const renderQuestion = () => {
    switch (currentQuestion.type) {
      case 'dropdown':
        return (
          <div className="dropdown-container">
            <select
              value={answers[currentQuestion.id] || ''}
              onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
              className="country-dropdown"
            >
              <option value="">Select a country...</option>
              {currentQuestion.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {currentQuestion.required && !isCurrentQuestionAnswered() && (
              <p className="required-message">Please select an option to continue</p>
            )}
          </div>
        );
      case 'multi-select':
        return (
          <div className="multi-select-options">
            {currentQuestion.options.map((option) => (
              <label key={option.value} className="checkbox-label">
                <input
                  type="checkbox"
                  value={option.value}
                  checked={answers[currentQuestion.id]?.includes(option.value) || false}
                  onChange={(e) => {
                    const currentSelection = answers[currentQuestion.id] || [];
                    if (e.target.checked) {
                      handleAnswerChange(currentQuestion.id, [...currentSelection, option.value]);
                    } else {
                      handleAnswerChange(
                        currentQuestion.id,
                        currentSelection.filter((item: string) => item !== option.value)
                      );
                    }
                  }}
                />
                <span className="checkbox-text">{option.label}</span>
              </label>
            ))}
            {currentQuestion.required && !isCurrentQuestionAnswered() && (
              <p className="required-message">Please select at least one option to continue</p>
            )}
          </div>
        );
      case 'slider':
        const sliderValue = answers[currentQuestion.id] || (currentQuestion.min || 1);
        return (
          <div>
            <input
              type="range"
              min={currentQuestion.min || 1}
              max={currentQuestion.max || 10}
              value={sliderValue}
              onChange={(e) => handleAnswerChange(currentQuestion.id, parseInt(e.target.value))}
            />
            <div className="slider-labels-container">
              {Object.entries(currentQuestion.labels || {}).map(([value, label]) => (
                <span key={value} className="slider-label-item">
                  {label}
                </span>
              ))}
            </div>
            <p className="current-value">Current value: {sliderValue}</p>
          </div>
        );
      case 'single-select':
        return (
          <div className="single-select-options">
            {(currentQuestion.options || []).map((option) => (
              <label key={option.value} className="radio-label">
                <input
                  type="radio"
                  value={option.value}
                  checked={answers[currentQuestion.id] === option.value}
                  onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                />
                <span className="radio-text">{option.label}</span>
              </label>
            ))}
            {currentQuestion.required && !isCurrentQuestionAnswered() && (
              <p className="required-message">Please select an option to continue</p>
            )}
          </div>
        );
      case 'ranking':
        const rankingOptions = answers[currentQuestion.id] || [...(currentQuestion.options || [])];
        return (
          <div>
            <div className="ranking-list">
              {rankingOptions.map((option: { value: string; label: string }, index: number) => (
                <div
                  key={option.value}
                  className="ranking-item"
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, index)}
                >
                  {index + 1}. {option.label}
                </div>
              ))}
            </div>
            <p className="ranking-instruction">Drag and drop to reorder by importance</p>
            {currentQuestion.required && !isCurrentQuestionAnswered() && (
              <p className="required-message">Please arrange the items to continue</p>
            )}
          </div>
        );
      default:
        return <p>Unknown question type.</p>;
    }
  };

  // Helper function to get section title
  const getSectionTitle = () => {
    if (currentQuestionIndex <= 12) {
      return "Personal Information";
    } else {
      return "About Your Mind and Happiness";
    }
  };

  // Helper function to get progress within section
  const getSectionProgress = () => {
    if (currentQuestionIndex <= 12) {
      return `${currentQuestionIndex + 1} of 13`;
    } else {
      return `${currentQuestionIndex - 12} of ${questions.length - 13}`;
    }
  };

  return (
    <div className="questionnaire-container">
      <div className="questionnaire-card">
        <div className="questionnaire-header">
          <Logo />
          <div className="section-info">
            <span className="section-title">{getSectionTitle()}</span>
            <span className="section-progress">{getSectionProgress()}</span>
          </div>
          <h1>{currentQuestion.title}</h1>
        </div>

        <div className="questionnaire-content">
          {renderQuestion()}
        </div>

        <div className="navigation-buttons">
          {currentQuestionIndex > 0 && (
            <button className="nav-button back" onClick={handleBack}>
              Back
            </button>
          )}
          
          <button 
            className={`nav-button next ${!isCurrentQuestionAnswered() ? 'disabled' : ''}`}
            onClick={handleNext}
            disabled={!isCurrentQuestionAnswered()}
          >
            {currentQuestionIndex === questions.length - 1 ? 'Complete' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Questionnaire;

