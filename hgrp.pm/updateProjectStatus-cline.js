// updateProjectStatus-cline.js
// For use with Cline automation: calculates overall project percent done and updates last_updated
// Place this in hgrp.pm/ and reference from your Cline rule

const fs = require('fs');
const path = require('path');
const statusPath = path.join(__dirname, 'ProjectStatus.json');

const data = JSON.parse(fs.readFileSync(statusPath, 'utf8'));
const tasks = data.tasks || [];
if (tasks.length > 0) {
  data.overall_percent_done = Math.round(
    tasks.reduce((sum, t) => sum + (t.percent_done || 0), 0) / tasks.length
  );
} else {
  data.overall_percent_done = 0;
}
data.last_updated = new Date().toISOString();

fs.writeFileSync(statusPath, JSON.stringify(data, null, 2));
console.log('Updated overall_percent_done and last_updated for Cline.');
