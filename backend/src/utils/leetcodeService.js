import axios from 'axios';

/**
 * Fetch LeetCode user profile and solved problems
 * @param {string} username - LeetCode username
 * @returns {Object} User data including solved problems
 */
export const fetchLeetCodeUserData = async (username) => {
    try {
        // GraphQL query to fetch user's solved problems
        const graphqlQuery = {
            query: `
                query getUserProfile($username: String!) {
                    matchedUser(username: $username) {
                        username
                        submitStats: submitStatsGlobal {
                            acSubmissionNum {
                                difficulty
                                count
                                submissions
                            }
                        }
                        profile {
                            realName
                            userAvatar
                            ranking
                        }
                    }
                    recentAcSubmissionList(username: $username, limit: 20) {
                        title
                        titleSlug
                        timestamp
                    }
                }
            `,
            variables: { username }
        };

        const response = await axios.post('https://leetcode.com/graphql', graphqlQuery, {
            headers: {
                'Content-Type': 'application/json',
                'Referer': 'https://leetcode.com'
            }
        });

        if (!response.data.data.matchedUser) {
            throw new Error('User not found on LeetCode');
        }

        const userData = response.data.data.matchedUser;
        const recentSubmissions = response.data.data.recentAcSubmissionList;

        // Now fetch all solved problems
        const solvedProblemsQuery = {
            query: `
                query userProfileQuestions($username: String!) {
                    allQuestionsCount {
                        difficulty
                        count
                    }
                    matchedUser(username: $username) {
                        submitStats: submitStatsGlobal {
                            acSubmissionNum {
                                difficulty
                                count
                            }
                        }
                        problemsSolvedBeatsStats {
                            difficulty
                            percentage
                        }
                        submitStatsGlobal {
                            acSubmissionNum {
                                difficulty
                                count
                            }
                        }
                    }
                }
            `,
            variables: { username }
        };

        const solvedResponse = await axios.post('https://leetcode.com/graphql', solvedProblemsQuery, {
            headers: {
                'Content-Type': 'application/json',
                'Referer': 'https://leetcode.com'
            }
        });

        return {
            username: userData.username,
            realName: userData.profile?.realName,
            avatar: userData.profile?.userAvatar,
            ranking: userData.profile?.ranking,
            submitStats: userData.submitStats,
            recentSubmissions: recentSubmissions || [],
            allQuestionsCount: solvedResponse.data.data.allQuestionsCount
        };
    } catch (error) {
        console.error('Error fetching LeetCode data:', error.message);
        throw new Error(`Failed to fetch LeetCode data: ${error.message}`);
    }
};

/**
 * Fetch all solved problems for a user
 * This requires a different approach as LeetCode API is limited
 * @param {string} username 
 */
export const fetchAllSolvedProblems = async (username) => {
    try {
        // This query fetches submission history
        const query = {
            query: `
                query recentAcSubmissions($username: String!, $limit: Int!) {
                    recentAcSubmissionList(username: $username, limit: $limit) {
                        title
                        titleSlug
                        timestamp
                    }
                }
            `,
            variables: { username, limit: 1000 }
        };

        const response = await axios.post('https://leetcode.com/graphql', query, {
            headers: {
                'Content-Type': 'application/json',
                'Referer': 'https://leetcode.com'
            }
        });

        const submissions = response.data.data.recentAcSubmissionList || [];
        
        // Extract unique problem slugs
        const uniqueProblems = [...new Set(submissions.map(s => s.titleSlug))];
        
        return uniqueProblems;
    } catch (error) {
        console.error('Error fetching solved problems:', error.message);
        throw new Error(`Failed to fetch solved problems: ${error.message}`);
    }
};

/**
 * Map LeetCode problem title/slug to our database problemId
 * @param {string} titleSlug - LeetCode problem slug
 * @returns {string} Problem ID or slug
 */
export const mapLeetCodeProblemToId = (titleSlug) => {
    // This will need to be customized based on how your problemId is stored
    // For now, return the slug as-is
    return titleSlug;
};
