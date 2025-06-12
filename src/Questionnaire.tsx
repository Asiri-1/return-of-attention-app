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
        { value: 'emotional_regulation', label: '🧘‍♀️ Better emotional regulation' },
        { value: 'productivity', label: '⚡ Increased productivity' },
        { value: 'relationships', label: '❤️ Improve relationships' },
        { value: 'spiritual_growth', label: '🕯️ Spiritual development' },
        { value: 'habit_formation', label: '🔄 Build healthy habits' },
        { value: 'curiosity', label: '🤔 Just curious about mindfulness' },
        { value: 'other', label: '🌟 Other reasons' },
      ],
    },
    {
      id: 'q2_experience',
      title: 'How would you describe your experience with meditation or mindfulness practices?',
      type: 'slider' as const,
      required: true,
      min: 1,
      max: 5,
      labels: {
        1: 'Complete beginner, never tried',
        2: 'Curious but minimal experience',
        3: 'Some experience, inconsistent practice',
        4: 'Regular practitioner, established routine',
        5: 'Advanced practitioner, deep experience',
      },
    },
    {
      id: 'q3_frequency',
      title: 'How often do you currently practice mindfulness or meditation?',
      type: 'single-select' as const,
      required: true,
      options: [
        { value: 'never', label: '🚫 Never' },
        { value: 'rarely', label: '🌙 Rarely (few times a year)' },
        { value: 'occasionally', label: '🌱 Occasionally (monthly)' },
        { value: 'weekly', label: '📅 Weekly' },
        { value: 'few-times-week', label: '🔄 A few times a week' },
        { value: 'daily', label: '☀️ Daily' },
        { value: 'multiple-daily', label: '🌟 Multiple times daily' },
      ],
    },
    {
      id: 'q4_primary_goal',
      title: 'What is your primary goal for practicing mindfulness?',
      type: 'single-select' as const,
      required: true,
      options: [
        { value: 'stress_reduction', label: '😌 Stress reduction and relaxation' },
        { value: 'focus_concentration', label: '🎯 Improved focus and concentration' },
        { value: 'emotional_wellbeing', label: '💚 Better emotional well-being' },
        { value: 'sleep_improvement', label: '😴 Better sleep quality' },
        { value: 'self_awareness', label: '🪞 Increased self-awareness' },
        { value: 'spiritual_growth', label: '🕯️ Spiritual development' },
        { value: 'habit_building', label: '🏗️ Building a consistent practice' },
        { value: 'pain_management', label: '🩹 Managing chronic pain or illness' },
        { value: 'performance', label: '🏆 Enhanced performance (work/sports)' },
        { value: 'relationships', label: '❤️ Better relationships' },
        { value: 'general_wellness', label: '🌈 Overall wellness and balance' },
      ],
    },
    {
      id: 'q5_practices',
      title: 'What kind of mindfulness practices are you most interested in exploring? (Select all that apply)',
      type: 'multi-select' as const,
      required: true,
      options: [
        { value: 'breathing', label: '🌬️ Breathing exercises' },
        { value: 'body_scan', label: '🧘‍♀️ Body scan meditation' },
        { value: 'walking', label: '🚶‍♂️ Walking meditation' },
        { value: 'loving_kindness', label: '💝 Loving-kindness meditation' },
        { value: 'visualization', label: '🌅 Visualization techniques' },
        { value: 'mindful_eating', label: '🍎 Mindful eating' },
        { value: 'movement', label: '🤸‍♀️ Mindful movement/yoga' },
        { value: 'journaling', label: '📝 Mindful journaling' },
        { value: 'nature', label: '🌳 Nature-based practices' },
        { value: 'sound', label: '🔔 Sound meditation (bells, singing bowls)' },
        { value: 'mantra', label: '🕉️ Mantra repetition' },
        { value: 'open_awareness', label: '🌌 Open awareness meditation' },
        { value: 'daily_activities', label: '☕ Mindfulness in daily activities' },
      ],
    },
    {
      id: 'q6_time_commitment',
      title: 'Realistically, how much time can you dedicate to Return of Attention practice on most days?',
      type: 'single-select' as const,
      required: true,
      options: [
        { value: '5-10-min', label: '⏰ 5-10 minutes (Beginner friendly)' },
        { value: '10-20-min', label: '📅 10-20 minutes (Building consistency)' },
        { value: '20-30-min', label: '🧘‍♀️ 20-30 minutes (Committed practice)' },
        { value: '30-plus-min', label: '🌟 30+ minutes (Intensive development)' },
        { value: 'varies', label: '🔄 Varies day to day (Flexible approach)' },
      ],
    },
    {
      id: 'q7_progress_tracking',
      title: 'How important is it for you to track your progress and see your mindfulness journey visually?',
      type: 'single-select' as const,
      required: true,
      options: [
        { value: 'very-important', label: '⭐ Very important - I love seeing my progress' },
        { value: 'somewhat-important', label: '📊 Somewhat important - helpful for motivation' },
        { value: 'neutral', label: '🤷‍♀️ Neutral - I can take it or leave it' },
        { value: 'not-important', label: '🎯 Not important - I prefer to focus on the practice itself' },
        { value: 'prefer-simple', label: '🌱 I prefer simple, minimal tracking' },
      ],
    },
  ];

  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;

  // Determine section info
  const getSectionInfo = () => {
    if (currentQuestionIndex <= 12) {
      return {
        section: 'Personal Information',
        questionNumber: currentQuestionIndex + 1,
        totalInSection: 13,
      };
    } else {
      return {
        section: 'About Your Mind and Happiness',
        questionNumber: currentQuestionIndex - 12,
        totalInSection: 7,
      };
    }
  };

  const sectionInfo = getSectionInfo();

  const handleAnswer = (value: any) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: value
    }));
  };

  const handleNext = () => {
    if (!isAnswered()) {
      return; // Don't proceed if question is not answered
    }

    if (isLastQuestion) {
      onComplete(answers);
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const isAnswered = () => {
    const answer = answers[currentQuestion.id];
    if (currentQuestion.type === 'multi-select') {
      return answer && Array.isArray(answer) && answer.length > 0;
    }
    return answer !== undefined && answer !== null && answer !== '';
  };

  const renderQuestion = () => {
    const answer = answers[currentQuestion.id];

    switch (currentQuestion.type) {
      case 'single-select':
        return (
          <div className="options-container">
            {currentQuestion.options?.map((option, index) => (
              <label key={option.value} className="option-item">
                <input
                  type="radio"
                  name={currentQuestion.id}
                  value={option.value}
                  checked={answer === option.value}
                  onChange={(e) => handleAnswer(e.target.value)}
                />
                <span className="option-label">{option.label}</span>
              </label>
            ))}
          </div>
        );

      case 'multi-select':
        return (
          <div className="options-container">
            {currentQuestion.options?.map((option, index) => (
              <label key={option.value} className="option-item">
                <input
                  type="checkbox"
                  value={option.value}
                  checked={answer && Array.isArray(answer) && answer.includes(option.value)}
                  onChange={(e) => {
                    const currentAnswers = answer && Array.isArray(answer) ? answer : [];
                    if (e.target.checked) {
                      handleAnswer([...currentAnswers, option.value]);
                    } else {
                      handleAnswer(currentAnswers.filter(v => v !== option.value));
                    }
                  }}
                />
                <span className="option-label">{option.label}</span>
              </label>
            ))}
          </div>
        );

      case 'dropdown':
        return (
          <div className="dropdown-container">
            <select
              value={answer || ''}
              onChange={(e) => handleAnswer(e.target.value)}
              className="dropdown-select"
            >
              <option value="">Select your country</option>
              {currentQuestion.options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        );

      case 'slider':
        const sliderValue = answer || currentQuestion.min || 1;
        return (
          <div className="slider-container">
            <input
              type="range"
              min={currentQuestion.min}
              max={currentQuestion.max}
              value={sliderValue}
              onChange={(e) => handleAnswer(parseInt(e.target.value))}
              className="slider"
            />
            <div className="slider-labels">
              {Object.entries(currentQuestion.labels || {}).map(([value, label]) => (
                <div key={value} className="slider-label-item">
                  {label}
                </div>
              ))}
            </div>
            <div className="slider-value">
              Current value: {sliderValue}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="questionnaire-container">
      <div className="questionnaire-header">
        <Logo />
        <div className="progress-info">
          <div className="section-title">{sectionInfo.section}</div>
          <div className="question-counter">
            {sectionInfo.questionNumber} of {sectionInfo.totalInSection}
          </div>
        </div>
      </div>

      <div className="question-content">
        <h2 className="question-title">{currentQuestion.title}</h2>
        {renderQuestion()}
        
        {currentQuestion.required && !isAnswered() && (
          <div className="required-message">
            Please select an option to continue
          </div>
        )}
      </div>

      <div className="navigation-buttons">
        <button
          onClick={handleBack}
          disabled={currentQuestionIndex === 0}
          className="nav-button back-button"
        >
          Back
        </button>
        
        <button
          onClick={handleNext}
          disabled={currentQuestion.required && !isAnswered()}
          className="nav-button next-button"
        >
          {isLastQuestion ? 'Complete' : 'Next'}
        </button>
      </div>
    </div>
  );
};

export default Questionnaire;

