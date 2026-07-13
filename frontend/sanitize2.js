const fs = require('fs');
let content = fs.readFileSync('script.js', 'utf8');

content = content.replace(/historyList\.innerHTML = consultations\.map\((.*?)\)\.join\(""\);/gs, 'historyList.innerHTML = DOMPurify.sanitize(consultations.map($1).join(""));');
content = content.replace(/tbody\.innerHTML = rows\.map\((.*?)\)\.join\(""\);/gs, 'tbody.innerHTML = DOMPurify.sanitize(rows.map($1).join(""));');
content = content.replace(/tbody\.innerHTML = PAST_APPOINTMENTS\.map\((.*?)\)\.join\(""\);/gs, 'tbody.innerHTML = DOMPurify.sanitize(PAST_APPOINTMENTS.map($1).join(""));');
content = content.replace(/tbody\.innerHTML = PATIENTS\.map\((.*?)\)\.join\(""\);/gs, 'tbody.innerHTML = DOMPurify.sanitize(PATIENTS.map($1).join(""));');
content = content.replace(/tbody\.innerHTML = data\.map\((.*?)\)\.join\(""\);/gs, 'tbody.innerHTML = DOMPurify.sanitize(data.map($1).join(""));');
content = content.replace(/tbody\.innerHTML = MEDICINE_DATA\.map\((.*?)\)\.join\(""\);/gs, 'tbody.innerHTML = DOMPurify.sanitize(MEDICINE_DATA.map($1).join(""));');
content = content.replace(/tbody\.innerHTML = filtered\.map\((.*?)\)\.join\(""\);/gs, 'tbody.innerHTML = DOMPurify.sanitize(filtered.map($1).join(""));');
content = content.replace(/tbody\.innerHTML = CURRENT_BILL\.medicines\.map\((.*?)\)\.join\(""\);/gs, 'tbody.innerHTML = DOMPurify.sanitize(CURRENT_BILL.medicines.map($1).join(""));');
content = content.replace(/tbody\.innerHTML = REPORT_DATA\.map\((.*?)\)\.join\(""\);/gs, 'tbody.innerHTML = DOMPurify.sanitize(REPORT_DATA.map($1).join(""));');
content = content.replace(/patListBox\.innerHTML = filtered\.map\((.*?)\)\.join\(""\);/gs, 'patListBox.innerHTML = DOMPurify.sanitize(filtered.map($1).join(""));');
content = content.replace(/tbody\.innerHTML = logs\.map\((.*?)\)\.join\(""\);/gs, 'tbody.innerHTML = DOMPurify.sanitize(logs.map($1).join(""));');

fs.writeFileSync('script.js', content);
console.log('Sanitized script.js');
