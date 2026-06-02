const SCHEMES_DB = [
  {
    id: 1,
    key: 'pmay',
    minAge: 18,
    maxAge: 100,
    maxIncome: 300000,
    translations: {
      en: {
        name: 'Pradhan Mantri Awas Yojana (PMAY)',
        short: 'Housing for the rural poor.',
        full: 'Provides pucca houses with basic amenities to all houseless households and those living in kutcha and dilapidated houses. Beneficiaries receive financial assistance and technical support to construct permanent houses.'
      },
      hi: {
        name: 'प्रधान मंत्री आवास योजना (PMAY)',
        short: 'ग्रामीण गरीबों के लिए आवास।',
        full: 'निर्मल और टिकाऊ घर उपलब्ध कराने के लिए लाभार्थियों को वित्तीय सहायता और तकनीकी समर्थन प्रदान किया जाता है।'
      }
    }
  },
  {
    id: 2,
    key: 'mgnrega',
    minAge: 18,
    maxAge: 65,
    maxIncome: 500000,
    translations: {
      en: {
        name: 'MGNREGA',
        short: 'Guarantees 100 days of wage employment.',
        full: 'Mahatma Gandhi National Rural Employment Guarantee Act enhances livelihood security in rural areas by providing at least 100 days of guaranteed wage employment in a financial year to adult members of any rural household.'
      },
      hi: {
        name: 'मनरेगा (MGNREGA)',
        short: '100 दिनो की रोजगार गारंटी।',
        full: 'ग्रामीण क्षेत्रों में आजीविका सुरक्षा बढ़ाने के लिए न्यूनतम 100 दिनों का मजदूरी आधारित रोजगार प्रदान किया जाता है।'
      }
    }
  },
  {
    id: 3,
    key: 'pmkisan',
    minAge: 18,
    maxAge: 100,
    maxIncome: 600000,
    translations: {
      en: {
        name: 'PM Kisan Samman Nidhi',
        short: 'Income support to landholding farmer families.',
        full: 'Provides income support of ₹6,000 per year in three equal installments to all land holding farmer families to supplement their financial needs for procuring inputs and domestic needs.'
      },
      hi: {
        name: 'पीएम किसान सम्मान निधि',
        short: 'कृषक परिवारों के लिए आय सहायता।',
        full: 'भूमि धारक किसान परिवारों को सालाना ₹6,000 की आर्थिक सहायता तीन किस्तों में प्रदान की जाती है।'
      }
    }
  },
  {
    id: 4,
    key: 'nsap',
    minAge: 60,
    maxAge: 120,
    maxIncome: 200000,
    translations: {
      en: {
        name: 'National Social Assistance Programme',
        short: 'Pension and assistance for vulnerable citizens.',
        full: 'A welfare program that provides financial assistance to the elderly, widows and persons with disabilities through various pension schemes and support measures.'
      },
      hi: {
        name: 'राष्ट्रीय सामाजिक सहायता कार्यक्रम',
        short: 'जोखिम में लोगों के लिए पेंशन और सहायता।',
        full: 'यह कल्याणकारी कार्यक्रम बुजुर्गों, विधवाओं और विकलांग व्यक्तियों को वित्तीय सहायता प्रदान करता है।'
      }
    }
  },
  {
    id: 5,
    key: 'sukanya',
    minAge: 0,
    maxAge: 10,
    maxIncome: 1000000,
    translations: {
      en: {
        name: 'Sukanya Samriddhi Yojana',
        short: 'Savings scheme for girl children.',
        full: 'A small deposit scheme for the girl child that encourages parents to build a fund for the future education and marriage expenses of their daughter.'
      },
      hi: {
        name: 'सुकन्या समृद्धि योजना',
        short: 'कन्याओं के लिए बचत योजना।',
        full: 'यह योजना माता-पिता को अपनी बेटी के भविष्य के शिक्षा और विवाह खर्चों के लिए बचत करने में मदद करती है।'
      }
    }
  },
  {
    id: 6,
    key: 'jaljeevan',
    minAge: 18,
    maxAge: 100,
    maxIncome: 10000000,
    translations: {
      en: {
        name: 'Jal Jeevan Mission',
        short: 'Tap water supply to rural households.',
        full: 'Har Ghar Jal aims to provide functional household tap connections to every rural household, ensuring safe and adequate drinking water.'
      },
      hi: {
        name: 'जल जीवन मिशन',
        short: 'ग्रामीण घरों तक नल के पानी की आपूर्ति।',
        full: 'हर घर जल पहल का लक्ष्य हर ग्रामीण घर तक कार्यशील नल कनेक्शन पहुँचना और सुरक्षित पेयजल सुनिश्चित करना है।'
      }
    }
  },
  {
    id: 7,
    key: 'ddugky',
    minAge: 15,
    maxAge: 35,
    maxIncome: 400000,
    translations: {
      en: {
        name: 'DDU-GKY',
        short: 'Rural skill development for youth.',
        full: 'Deen Dayal Upadhyaya Grameen Kaushalya Yojana focuses on skill development and placement linked training for rural youth to increase employability.'
      },
      hi: {
        name: 'दीन दयाल उपाध्याय ग्रामीण कौशल योजना',
        short: 'युवा कौशल विकास कार्यक्रम।',
        full: 'यह योजना ग्रामीण युवाओं के लिए कौशल विकास और रोजगारपरक प्रशिक्षण पर केंद्रित है।'
      }
    }
  },
  {
    id: 8,
    key: 'pmsym',
    minAge: 18,
    maxAge: 100,
    maxIncome: 1000000,
    translations: {
      en: {
        name: 'PM-SYM',
        short: 'Pension scheme for unorganized workers.',
        full: 'A contributory pension scheme for unorganised sector workers with monthly contribution and assured minimum pension on attaining 60 years.'
      },
      hi: {
        name: 'प्रधानमंत्री श्रमयोगी मानधन',
        short: 'असंगठित कामगारों के लिए पेंशन योजना।',
        full: 'यह असंगठित क्षेत्र के कामगारों को योगदान आधारित पेंशन प्रदान करती है।'
      }
    }
  },
  {
    id: 9,
    key: 'pmfby',
    minAge: 18,
    maxAge: 100,
    maxIncome: 2000000,
    translations: {
      en: {
        name: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
        short: 'Crop insurance for farmers.',
        full: 'Provides financial support to farmers suffering crop loss/damage arising out of natural calamities, pests & diseases.'
      },
      hi: {
        name: 'प्रधानमंत्री फसल बीमा योजना',
        short: 'किसानों के लिए फसल बीमा।',
        full: 'प्राकृतिक आपदाओं, कीटों और बीमारियों के कारण फसल हानि पर किसानों को वित्तीय सहायता प्रदान करती है।'
      }
    }
  }
];

export default SCHEMES_DB;
