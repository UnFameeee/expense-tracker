const path = require('path');
const fs = require('fs');

// Load language files
const en = require('../locales/en');

// Default language
const defaultLanguage = 'en';

// Available languages
const languages = {
  en
};

// Get translation function
const getTranslation = (lang = defaultLanguage) => {
  // If language is not available, use default
  if (!languages[lang]) {
    lang = defaultLanguage;
  }
  
  // Return translation function
  return (key, replacements = {}) => {
    // Get translation string
    let translation = languages[lang][key] || key;
    
    // Replace placeholders
    Object.keys(replacements).forEach(placeholder => {
      translation = translation.replace(`{${placeholder}}`, replacements[placeholder]);
    });
    
    return translation;
  };
};

module.exports = {
  getTranslation,
  defaultLanguage,
  languages
};
