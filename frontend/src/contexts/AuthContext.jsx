@@
   const rateTeam = async (teamId, ratingData) => {
@@
   };
 
+  // Explicit view endpoint to increment views deterministically
+  const viewTeam = async (teamId) => {
+    try {
+      const response = await makeAuthenticatedRequest(`${backendUrl}/api/teams/${teamId}/view`);
+      if (!response.ok) {
+        return { success: false };
+      }
+      const data = await response.json();
+      return { success: true, team: data };
+    } catch (error) {
+      return { success: false };
+    }
+  };
+
   const loadTeamDetails = async (teamId) => {
@@
   const value = {
@@
-    rateTeam,
+    rateTeam,
+    viewTeam,
     loadTeamDetails,
     loadPublicTeamDetails,
     saveTeamToSlot,
   };