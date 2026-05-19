import React, { createContext, useState, useContext } from 'react';

const LanguageContext = createContext();

const translations = {
  en: {
    // Header & Landing
    features: "Features",
    howItWorks: "How it Works",
    community: "Community",
    reportComplaint: "Register Complaint",
    schemes: "Schemes",
    profile: "Profile",
    dashboard: "Dashboard",
    login: "Login",
    logout: "Logout",
    heroTitleLight: "Empowering",
    heroTitleMiddle: " Gram Panchayats.",
    heroTitleBlue: "Revitalizing",
    heroTitleEnd: " Villages.",
    heroDesc: "A dedicated digital workspace for rural communities to report civic issues like broken streetlights, water supply shortages, and sanitation problems, enabling smooth Gram Panchayat workflows.",
    btnReport: "File Village Complaint",
    activeStatus: "LIVE",
    precisionTitle: "Smarter Governance for",
    precisionField: "Our Villages.",
    precisionDesc: "Our platform maps rural civic grievances using exact GPS coordinate tags and photo uploads, routing tasks directly to Gram Panchayat field workers for transparent and fast resolutions.",
    evidenceLabel: "Verifiable Public Works",
    accuracyLabel: "Panchayat Response Time",
    monitoringLabel: "PANCHAYAT WORKFLOW",
    smartPortal: "Smart Gram Panchayat Portal",
    unifiedEco: "Unified Rural",
    ecosystem: "Ecosystem.",
    reportingTitle: "VILLAGE REPORTING",
    reportingDesc: "Submit localized water leaks, road damages, power cuts, or waste dump issues with live photo proof.",
    adminTitle: "PANCHAYAT ORCHESTRATION",
    adminDesc: "Panchayat admins and Sarpanch approve complaints, allocate budgets, and dispatch workers.",
    volunteerTitle: "FIELD-WORK RESOLUTION",
    volunteerDesc: "Field personnel receive tasks, resolve infrastructure issues, and upload validation reports.",

    // Sidebar
    home: "Home",
    systemOverview: "System Overview",
    fieldWorkers: "Field Workers",
    complaintsMgmt: "Complaints Management",
    settings: "Settings",
    sysAdmin: "System Admin",
    citizen: "Citizen",

    // Login & Signup
    loginTitle: "Citizen & Civic Administration Portal",
    signupTitle: "Register a new citizen or admin account",
    registerHere: "Register Here",
    newToGram: "New to GramSuvidha?",
    loginBtn: "Sign In",
    registerBtn: "Register Now",
    email: "Email Address",
    password: "Password",
    rememberMe: "Remember me",
    forgotPass: "Forgot password?",
    alreadyReg: "Already registered?",
    loginHere: "Login Here",
    regType: "Registration Type",
    pAdmin: "Panchayat Admin",
    firstName: "First Name",
    lastName: "Last Name",
    age: "Age",
    phone: "Mobile Number",
    gender: "Gender",
    selectGender: "Select Gender",
    confirmPass: "Confirm Password",
    villageId: "Official Panchayat / Village ID",
    categoriesTitle: "Select Category to Report",
    categoriesDesc: "Issues will be routed to corresponding Gram Panchayat department",
    waterTitle: "Water & Sanitation",
    waterDesc: "Pipeline leakage, drainage blocks, public toilets",
    lightTitle: "Electricity & Lights",
    lightDesc: "Streetlights not working, loose power lines",
    roadTitle: "Roads & Cleanliness",
    roadDesc: "Potholes, garbage disposal, road obstruction",
    schemeTitle: "Welfare Schemes",
    schemeDesc: "Apply for housing, agricultural, and drinking water schemes"
  },
  hi: {
    // Header & Landing
    features: "विशेषताएं",
    howItWorks: "यह कैसे काम करता है",
    community: "समुदाय",
    reportComplaint: "शिकायत दर्ज करें",
    schemes: "सरकारी योजनाएं",
    profile: "प्रोफाइल विवरण",
    dashboard: "डैशबोर्ड",
    login: "लॉगिन करें",
    logout: "लॉगआउट",
    heroTitleLight: "सशक्त",
    heroTitleMiddle: " ग्राम पंचायत।",
    heroTitleBlue: "सम्पन्न",
    heroTitleEnd: " ग्रामीण भारत।",
    heroDesc: "ग्रामीण नागरिकों के लिए एक समर्पित मंच जहाँ पेयजल आपूर्ति, बंद स्ट्रीटलाइट, क्षतिग्रस्त सड़कें और स्वच्छता जैसी समस्याओं को दर्ज कर पंचायत द्वारा त्वरित समाधान पाया जा सकता है।",
    btnReport: "पंचायत शिकायत दर्ज करें",
    activeStatus: "सक्रिय",
    precisionTitle: "हमारे गाँवों के लिए",
    precisionField: "सशक्त सुशासन।",
    precisionDesc: "हमारा पोर्टल ग्राम पंचायत स्तर की शिकायतों को सटीक जीपीएस लोकेशन और फोटो साक्ष्य के साथ रिकॉर्ड करता है, जिससे पंचायत कर्मी बिना देरी किए सीधे स्थल पर काम शुरू कर सकें।",
    evidenceLabel: "सत्यापित सार्वजनिक कार्य",
    accuracyLabel: "पंचायत प्रतिक्रिया समय",
    monitoringLabel: "सक्रिय पंचायत निगरानी",
    smartPortal: "स्मार्ट ग्राम पंचायत पोर्टल",
    unifiedEco: "एकीकृत ग्रामीण",
    ecosystem: "कार्यप्रणाली।",
    reportingTitle: "ग्रामीण शिकायत रिपोर्टिंग",
    reportingDesc: "टूटी पाइपलाइन, जर्जर सड़कों, बिजली कटौती या कचरे के ढेरों की फोटो के साथ सीधे रिपोर्ट करें।",
    adminTitle: "पंचायत प्रशासनिक प्रबंधन",
    adminDesc: "सरपंच और पंचायत सचिव शिकायतों का सत्यापन कर बजट आवंटन और काम का वितरण करते हैं।",
    volunteerTitle: "क्षेत्रीय सुधार कार्य",
    volunteerDesc: "अधिकृत पंचायत फील्ड कर्मी आवंटित कार्य को पूरा कर स्थल सुधार का डिजिटल प्रमाण जमा करते हैं।",

    // Sidebar
    home: "मुख्य पृष्ठ",
    systemOverview: "सिस्टम सारांश",
    fieldWorkers: "क्षेत्र कार्यकर्ता",
    complaintsMgmt: "शिकायत प्रबंधन",
    settings: "सेटिंग्स",
    sysAdmin: "पंचायत व्यवस्थापक",
    citizen: "नागरिक",

    // Login & Signup
    loginTitle: "नागरिक एवं ग्राम पंचायत प्रशासन पोर्टल",
    signupTitle: "नागरिक या पंचायत अधिकारी का नया खाता बनाएं",
    registerHere: "यहाँ पंजीकरण करें",
    newToGram: "ग्रामसुविधा में नए हैं?",
    loginBtn: "साइन इन करें",
    registerBtn: "पंजीकरण करें",
    email: "ईमेल पता",
    password: "पासवर्ड",
    rememberMe: "मुझे याद रखें",
    forgotPass: "पासवर्ड भूल गए?",
    alreadyReg: "पहले से पंजीकृत हैं?",
    loginHere: "यहाँ लॉगिन करें",
    regType: "पंजीकरण का प्रकार",
    pAdmin: "पंचायत अधिकारी",
    firstName: "पहला नाम",
    lastName: "उपनाम",
    age: "आयु",
    phone: "मोबाइल नंबर",
    gender: "लिंग",
    selectGender: "लिंग चुनें",
    confirmPass: "पासवर्ड की पुष्टि करें",
    villageId: "आधिकारिक पंचायत / ग्राम कोड",
    categoriesTitle: "रिपोर्ट करने के लिए श्रेणी चुनें",
    categoriesDesc: "शिकायतें संबंधित ग्राम पंचायत विभाग को भेजी जाएंगी",
    waterTitle: "पेयजल और स्वच्छता",
    waterDesc: "पाइपलाइन रिसाव, जल निकासी बंद होना, सार्वजनिक शौचालय",
    lightTitle: "बिजली और स्ट्रीटलाइट",
    lightDesc: "स्ट्रीटलाइट खराब होना, ढीले बिजली के तार",
    roadTitle: "सड़कें और साफ-सफाई",
    roadDesc: "गड्ढे, कचरा निपटान, सड़क अवरोध",
    schemeTitle: "कल्याणकारी योजनाएं",
    schemeDesc: "आवास, कृषि और पेयजल योजनाओं के लिए आवेदन करें"
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');

  const t = (key) => {
    return translations[language][key] || key;
  };

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'en' ? 'hi' : 'en'));
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
