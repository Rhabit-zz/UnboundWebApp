import { useQuery } from '@tanstack/react-query';

const GITHUB_USERNAME = "Rhabit-zz";
const REPOSITORY_NAME = "UnboundDataBase";
const BRANCH_NAME = "main"; 

export function useGitHubJson(fileName) {
  const apiEndpointUrl = `https://github.com{GITHUB_USERNAME}/${REPOSITORY_NAME}/contents/${fileName}?ref=${BRANCH_NAME}`;

  return useQuery({
    queryKey: ['githubData', fileName],
    queryFn: async () => {
      try {
        const token = import.meta.env.VITE_GITHUB_TOKEN;

        const response = await fetch(apiEndpointUrl, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Accept": "application/vnd.github.v3.raw"
          }
        });

        // If GitHub returns a 502 Unicorn or 404 Error, trigger the catch block
        if (!response.ok) {
          throw new Error(`GitHub Cloud Server Unreachable: Status ${response.status}`);
        }

        return await response.json();

      } catch (cloudError) {
        console.warn(`Downlink offline. falling back to local database engine:`, cloudError.message);
        
        // NATIVE BACKUP FALLBACK LOOP:
        // Dynamically loads the file from your local src/database/ folder instantly
        const localModule = await import(`../database/${fileName}`);
        return localModule.default;
      }
    },
    staleTime: 1000 * 60 * 5, // Cache entries locally for 5 minutes
  });
}