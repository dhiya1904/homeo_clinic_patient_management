const fs = require('fs');
const files = ['index.html', 'patients.html', 'appointments.html', 'billing.html', 'communications.html', 'medicines.html', 'reports.html', 'settings.html', 'register.html'];

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  if (!content.includes('purify.min.js')) {
    content = content.replace('<script src="script.js"></script>', '<script src="https://cdnjs.cloudflare.com/ajax/libs/dompurify/3.0.6/purify.min.js"></script>\n  <script src="script.js"></script>');
    fs.writeFileSync(f, content);
    console.log('Updated ' + f);
  }
});
