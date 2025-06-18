import React, { useState } from 'react';
import './Questionnaire.css';

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
      title: 'Which country are you currently residing in?',
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
        { value: 'emotional_regulation', label: '❤️‍🩹 Emotional regulation' },
        { value: 'increase_happiness', label: '😊 Increase overall happiness' },
        { value: 'manage_addiction', label: '🔗 Manage addictive behaviors' },
        { value: 'spiritual_growth', label: '✨ Spiritual growth' },
        { value: 'curiosity', label: '🧐 Curiosity' },
        { value: 'other', label: '💡 Other' },
      ],
    },
    {
      id: 'q1_mindfulness_experience',
      title: 'What is your current level of experience with mindfulness or meditation?',
      type: 'single-select' as const,
      required: true,
      options: [
        { value: 'beginner', label: '👶 Beginner (new to mindfulness)' },
        { value: 'some_experience', label: '📚 Some experience (tried a few times)' },
        { value: 'regular_practitioner', label: '🧘 Regular practitioner (daily/weekly)' },
        { value: 'advanced', label: '🌟 Advanced practitioner (years of practice)' },
      ],
    },
    {
      id: 'q1_practice_goals',
      title: 'What do you hope to achieve through mindfulness practice? (Select all that apply)',
      type: 'multi-select' as const,
      required: true,
      options: [
        { value: 'daily_calm', label: '🧘 Find daily calm and peace' },
        { value: 'stress_reduction', label: '📉 Reduce stress and anxiety' },
        { value: 'improved_focus', label: '🧠 Improve focus and concentration' },
        { value: 'emotional_balance', label: '⚖️ Achieve emotional balance' },
        { value: 'better_relationships', label: '🤝 Foster better relationships' },
        { value: 'self_compassion', label: '💖 Cultivate self-compassion' },
        { value: 'spiritual_connection', label: '✨ Deepen spiritual connection' },
        { value: 'habit_breaking', label: '🔗 Break unhelpful habits' },
        { value: 'increased_joy', label: '😊 Experience more joy' },
        { value: 'sleep_improvement', label: '😴 Improve sleep' },
        { value: 'pain_management', label: '🤕 Manage chronic pain' },
        { value: 'other', label: '💡 Other personal goals' },
      ],
    },
    {
      id: 'q1_daily_mindfulness_time',
      title: 'How much time are you willing to dedicate to mindfulness practice daily?',
      type: 'single-select' as const,
      required: true,
      options: [
        { value: '5_min', label: '⏱️ 5 minutes' },
        { value: '10_min', label: '⏰ 10 minutes' },
        { value: '15_min', label: '🗓️ 15 minutes' },
        { value: '20_min', label: '⏳ 20 minutes' },
        { value: '30_min_plus', label: '🚀 30+ minutes' },
      ],
    },
    {
      id: 'q1_preferred_practice_time',
      title: 'When are you most likely to practice mindfulness?',
      type: 'multi-select' as const,
      required: true,
      options: [
        { value: 'morning', label: '☀️ Morning (e.g., after waking up)' },
        { value: 'midday', label: ' lunchtime)' },
        { value: 'afternoon', label: '🌆 Afternoon (e.g., after work)' },
        { value: 'evening', label: '🌙 Evening (e.g., before bed)' },
        { value: 'anytime', label: '🔄 Anytime I find a moment' },
      ],
    },
    {
      id: 'q1_distraction_level',
      title: 'How easily are you distracted during daily tasks or activities?',
      type: 'slider' as const,
      required: true,
      min: 1,
      max: 10,
      labels: {
        1: 'Rarely distracted',
        3: 'Occasionally distracted',
        5: 'Moderately distracted',
        7: 'Often distracted',
        10: 'Extremely distracted',
      },
    },
    {
      id: 'q1_stress_response',
      title: 'When faced with stress, how do you typically react?',
      type: 'multi-select' as const,
      required: true,
      options: [
        { value: 'calm', label: '🧘 Remain calm and composed' },
        { value: 'anxious', label: '😥 Feel anxious or overwhelmed' },
        { value: 'irritable', label: '😠 Become irritable or angry' },
        { value: 'withdrawn', label: '😔 Withdraw from others' },
        { value: 'proactive', label: '💪 Become proactive and problem-solve' },
        { value: 'distracted', label: ' distractions' },
        { value: 'physical_symptoms', label: '🤢 Experience physical symptoms (e.g., headaches, stomach issues)' },
        { value: 'overeat', label: '🍔 Overeat or under-eat' },
        { value: 'sleep_issues', label: '😴 Have trouble sleeping' },
        { value: 'other', label: '🤷 Other reaction' },
      ],
    },
    {
      id: 'q1_emotional_awareness',
      title: 'How aware are you of your emotions throughout the day?',
      type: 'slider' as const,
      required: true,
      min: 1,
      max: 10,
      labels: {
        1: 'Not at all aware',
        3: 'Slightly aware',
        5: 'Moderately aware',
        7: 'Very aware',
        10: 'Extremely aware',
      },
    },
    {
      id: 'q1_self_compassion',
      title: 'How often do you practice self-compassion (being kind to yourself)?',
      type: 'single-select' as const,
      required: true,
      options: [
        { value: 'never', label: '💔 Never' },
        { value: 'rarely', label: '😔 Rarely' },
        { value: 'sometimes', label: '😐 Sometimes' },
        { value: 'often', label: '😊 Often' },
        { value: 'always', label: '💖 Always' },
      ],
    },
    {
      id: 'q1_gratitude_practice',
      title: 'How often do you intentionally practice gratitude?',
      type: 'single-select' as const,
      required: true,
      options: [
        { value: 'never', label: '🚫 Never' },
        { value: 'rarely', label: '🤔 Rarely' },
        { value: 'sometimes', label: '🙂 Sometimes' },
        { value: 'often', label: '😊 Often' },
        { value: 'daily', label: '🌟 Daily' },
      ],
    },
    {
      id: 'q1_tech_usage',
      title: 'How many hours per day do you typically spend on digital devices (phone, computer, tablet) for non-work related activities?',
      type: 'single-select' as const,
      required: true,
      options: [
        { value: 'less_1', label: 'Less than 1 hour' },
        { value: '1_3', label: '1-3 hours' },
        { value: '3_5', label: '3-5 hours' },
        { value: '5_8', label: '5-8 hours' },
        { value: '8_plus', label: '8+ hours' },
      ],
    },
    {
      id: 'q1_social_media_impact',
      title: 'How does social media typically make you feel?',
      type: 'multi-select' as const,
      required: true,
      options: [
        { value: 'inspired', label: '✨ Inspired and connected' },
        { value: 'anxious', label: '😥 Anxious or stressed' },
        { value: 'jealous', label: '😒 Jealous or inadequate' },
        { value: 'informed', label: '📰 Informed and entertained' },
        { value: 'distracted', label: '😵 Distracted and unproductive' },
        { value: 'neutral', label: '😐 Neutral' },
        { value: 'other', label: '🤷 Other' },
      ],
    },
    {
      id: 'q1_nature_connection',
      title: 'How often do you spend time in nature or green spaces?',
      type: 'single-select' as const,
      required: true,
      options: [
        { value: 'daily', label: '🌳 Daily' },
        { value: 'several_times_week', label: '🌿 Several times a week' },
        { value: 'once_week', label: '🏞️ Once a week' },
        { value: 'rarely', label: '🍂 Rarely' },
        { value: 'never', label: '🚫 Never' },
      ],
    },
    {
      id: 'q1_learning_style',
      title: 'What is your preferred way to learn new mindfulness techniques?',
      type: 'multi-select' as const,
      required: true,
      options: [
        { value: 'guided_meditations', label: '🎧 Guided audio meditations' },
        { value: 'reading', label: '📚 Reading articles/books' },
        { value: 'videos', label: '📺 Watching videos/lectures' },
        { value: 'workshops', label: '👥 Attending workshops/classes' },
        { value: 'one_on_one', label: '🤝 One-on-one coaching' },
        { value: 'self_guided', label: '🚶 Self-guided practice' },
        { value: 'community', label: '🏘️ Community discussions' },
        { value: 'other', label: '💡 Other' },
      ],
    },
    {
      id: 'q1_support_needed',
      title: 'What kind of support would be most helpful for your mindfulness journey?',
      type: 'multi-select' as const,
      required: true,
      options: [
        { value: 'reminders', label: '🔔 Gentle reminders to practice' },
        { value: 'personalized_content', label: '🎯 Personalized content/exercises' },
        { value: 'community_support', label: '🤝 Community support/group sessions' },
        { value: 'expert_guidance', label: '🧠 Expert guidance/coaching' },
        { value: 'progress_tracking', label: '📈 Progress tracking and insights' },
        { value: 'motivation', label: '✨ Motivation and encouragement' },
        { value: 'no_support', label: '🚫 I prefer to practice independently' },
        { value: 'other', label: '💡 Other' },
      ],
    },
  ];

  const handleAnswer = (questionId: string, value: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleNext = () => {
    const currentQuestion = questions[currentQuestionIndex];
    if (currentQuestion.required && !answers[currentQuestion.id]) {
      alert('Please answer the current question before proceeding.');
      return;
    }
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      onComplete(answers);
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const currentQuestion = questions[currentQuestionIndex];

  const renderQuestion = () => {
    switch (currentQuestion.type) {
      case 'single-select':
        return (
          <div className="options-grid">
            {currentQuestion.options?.map(option => (
              <button
                key={option.value}
                className={`option-button ${answers[currentQuestion.id] === option.value ? 'selected' : ''}`}
                onClick={() => handleAnswer(currentQuestion.id, option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        );
      case 'multi-select':
        return (
          <div className="options-grid">
            {currentQuestion.options?.map(option => (
              <button
                key={option.value}
                className={`option-button ${answers[currentQuestion.id]?.includes(option.value) ? 'selected' : ''}`}
                onClick={() => {
                  const currentSelection = answers[currentQuestion.id] || [];
                  if (currentSelection.includes(option.value)) {
                    handleAnswer(
                      currentQuestion.id,
                      currentSelection.filter((item: string) => item !== option.value)
                    );
                  } else {
                    handleAnswer(
                      currentQuestion.id,
                      [...currentSelection, option.value]
                    );
                  }
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        );
      case 'dropdown':
        return (
          <select
            className="dropdown-select"
            value={answers[currentQuestion.id] || ''}
            onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
          >
            <option value="" disabled>Select an option</option>
            {currentQuestion.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      case 'slider':
        return (
          <div className="slider-container">
            <input
              type="range"
              min={currentQuestion.min}
              max={currentQuestion.max}
              value={answers[currentQuestion.id] || currentQuestion.min}
              onChange={(e) => handleAnswer(currentQuestion.id, parseInt(e.target.value))}
              className="range-slider"
            />
            <div className="slider-labels">
              {Object.entries(currentQuestion.labels || {}).map(([value, label]) => (
                <span
                  key={value}
                  style={{ left: `${((parseInt(value) - (currentQuestion.min || 0)) / ((currentQuestion.max || 10) - (currentQuestion.min || 0))) * 100}%` }}
                >
                  {label}
                </span>
              ))}
            </div>
            <div className="slider-value">
              Current Value: {answers[currentQuestion.id] || currentQuestion.min}
            </div>
          </div>
        );
      default:
        return <p>Unknown question type</p>;
    }
  };

  return (
    <div className="questionnaire-container">
      <div className="questionnaire-header">
        <h2>{currentQuestion.title}</h2>
      </div>
      <div className="questionnaire-body">
        {renderQuestion()}
      </div>
      <div className="questionnaire-navigation">
        {currentQuestionIndex > 0 && (
          <button onClick={handleBack} className="back-button">Back</button>
        )}
        <button onClick={handleNext} className="next-button">
          {currentQuestionIndex === questions.length - 1 ? 'Complete' : 'Next'}
        </button>
        <button onClick={onSkip} className="skip-button">Skip Questionnaire</button>
      </div>
      <div className="progress-indicator">
        Question {currentQuestionIndex + 1} of {questions.length}
      </div>
    </div>
  );
};

export default Questionnaire;


