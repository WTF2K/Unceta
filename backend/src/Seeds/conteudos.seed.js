const seedConteudos = async (db) => {
  try {
    const { conteudos, linguas } = db;

    const languageData = [
      { code: 'en', nome: 'English' },
      { code: 'fr', nome: 'Francais' },
      { code: 'de', nome: 'Deutsch' }
    ];

    for (const language of languageData) {
      await linguas.findOrCreate({ where: { code: language.code }, defaults: language });
    }

    // Define all content keys that the frontend expects
    const contentData = [
      // Shared navigation and interface labels
      { chave: 'nav_about', texto: 'About Us' },
      { chave: 'nav_industries', texto: 'Industries' },
      { chave: 'nav_products', texto: 'Solutions' },
      { chave: 'nav_news', texto: 'News' },
      { chave: 'nav_quality', texto: 'Quality' },
      { chave: 'nav_contacts', texto: 'Contacts' },
      { chave: 'hero_button', texto: 'Explore our solutions' },
      { chave: 'product_button', texto: 'Explore solution' },
      { chave: 'form_name_placeholder', texto: 'Your name' },
      { chave: 'form_email_placeholder', texto: 'Your email' },
      { chave: 'form_message_placeholder', texto: 'How can we help you?' },
      { chave: 'form_send_button', texto: 'Send message' },
      { chave: 'hero_image', texto: '' },
      { chave: 'about_image_1', texto: '' },
      { chave: 'about_image_2', texto: '' },
      { chave: 'about_image_3', texto: '' },
      { chave: 'about_image_4', texto: '' },

      // Hero section
      { chave: 'hero_title', texto: 'Connect to the\nright solutions\nwith Unceta.' },
      { chave: 'hero_subtitle', texto: 'Industrial solutions & components' },
      { chave: 'hero_description', texto: 'Connecting industrial partners with reliable components, technical solutions and trusted suppliers across multiple industries.' },

      // About section
      { chave: 'about_label', texto: 'About Unceta' },
      { chave: 'about_title', texto: 'The connection between industry and the right solution.' },
      { chave: 'about_text_1', texto: 'Unceta connects industrial partners with the right cutting, measuring and workshop solutions. We work with suppliers that meet demanding quality standards for professional use.' },
      { chave: 'about_text_2', texto: 'From machine-tool accessories to certified components, our catalogue is built around reliability, precision and technical knowledge.' },

      // Industries section
      { chave: 'industries_label', texto: 'Where we operate' },
      { chave: 'industries_title', texto: 'Industries we serve' },
      { chave: 'industries_description', texto: 'Our solutions support demanding applications across different industrial sectors.' },

      // Products section
      { chave: 'products_label', texto: 'Featured solutions' },
      { chave: 'products_title', texto: 'Components that keep industry moving.' },
      { chave: 'products_description', texto: 'A selection of components and technical solutions supplied to different industrial applications.' },

      // Quality section
      { chave: 'quality_label', texto: 'Quality & reliability' },
      { chave: 'quality_title', texto: 'Quality you can trust.' },
      { chave: 'quality_description', texto: 'We work with suppliers that meet recognized quality standards and demanding requirements for professional industrial applications.' },
        { chave: 'quality_certifications', texto: '[{"code":"ISO","num":"9001","text":"Quality Management"},{"code":"IATF","num":"16949","text":"Automotive Quality"},{"code":"ISO","num":"14001","text":"Environmental Management"}]' },

      // Contact section
      { chave: 'contact_label', texto: 'Contact' },
      { chave: 'contact_title', texto: "Let's connect." },
      { chave: 'contact_description', texto: 'Looking for the right component or industrial solution? Get in touch with our team.' },
      { chave: 'contact_address', texto: 'Estrada Nacional 1, 137\n3850-052 Albergaria-a-Velha, Portugal' },
      { chave: 'contact_phone', texto: '+351 234 529 670' },
      { chave: 'contact_email', texto: 'geral@unceta.pt' },
    ];

    // Upsert: Check if content exists, if not, create it
    for (const data of contentData) {
      const [record, created] = await conteudos.findOrCreate({
        where: { chave: data.chave },
        defaults: data
      });

      if (created) {
        console.log(`✅ Created seed: ${data.chave}`);
      }
    }

    console.log('✅ Conteúdos seed completed!');
  } catch (error) {
    console.error('❌ Error seeding conteúdos:', error.message);
  }
};

module.exports = seedConteudos;
