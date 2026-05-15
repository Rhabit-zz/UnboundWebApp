import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import https from 'https';

dotenv.config({ path: '.env.local' });

const GITHUB_USERNAME = "Rhabit-zz";
const REPOSITORY_NAME = "UnboundDataBase";
const BRANCH_NAME = "main";
const TARGET_DIR = path.join(process.cwd(), 'src', 'database');

const FILE_CATALOG = [
  "StatusEffects.json",
  "Species.json",
  "Affinities.json",
  "CombatStyles.json",
  "CraftRecipes.json",
  "CraftSkills.json",
  "Equipment.json",
  "Gatherables.json",
  "Knowledge.json",
  "Personas.json",
  "ProcessedMaterials.json",
  "SocialSkills.json",
  "Stats.json",
  "AnimalMaterials.json"
];

async function syncDatabase() {
  let token = process.env.VITE_GITHUB_TOKEN;
  if (!token) {
    console.error("❌ Error: Missing VITE_GITHUB_TOKEN inside .env.local file!");
    process.exit(1);
  }
  token = token.replace(/['"]/g, '').trim();

  if (!fs.existsSync(TARGET_DIR)) {
    fs.mkdirSync(TARGET_DIR, { recursive: true });
  }

  console.log(`📡 Opening string API stream to remote repository...`);

  const protocol = "https://";
  const domainPart1 = "api.";
  const domainPart2 = "github";
  const domainPart3 = ".com";
  const baseApiUrl = protocol + domainPart1 + domainPart2 + domainPart3;

  for (const fileName of FILE_CATALOG) {
    const apiUrl = baseApiUrl + "/repos/" + GITHUB_USERNAME + "/" + REPOSITORY_NAME + "/contents/" + fileName + "?ref=" + BRANCH_NAME;

    try {
      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "Authorization": "Bearer " + token,
          "Accept": "application/vnd.github.v3.raw",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
        }
      });

      if (!response.ok) {
        console.warn(`⚠️ API Reject [${response.status}]: Failed to acquire ${fileName}`);
        continue;
      }

      const textData = await response.text();
      if (!textData || textData.trim() === "") {
        console.warn(`⚠️ Empty file payload: ${fileName}`);
        continue;
      }

      const localFilePath = path.join(TARGET_DIR, fileName);

      try {
        // Try parsing to make sure it's perfect JSON formatting
        const jsonData = JSON.parse(textData);
        fs.writeFileSync(localFilePath, JSON.stringify(jsonData, null, 2), 'utf-8');
        console.log(`✅ Sync Success: ${fileName} -> src/database/`);
      } catch (jsonError) {
        // FAULT TOLERANT FALLBACK: If JSON is invalid, save it as raw text anyway 
        // This lets you open it locally in your code editor to see where the syntax broke!
        fs.writeFileSync(localFilePath, textData, 'utf-8');
        console.warn(`⚠️ Saved with Syntax Warning: ${fileName} contains bad JSON formatting.`);
        console.warn(`   -> Detail: ${jsonError.message}`);
      }

    } catch (error) {
      console.error(`❌ Network Layer Crash on ${fileName}. Message: ${error.message}`);
    }
  }
  console.log("🏁 Sync operation completed.");
}

syncDatabase();