/**
 * ACME Challenge Handler for Let's Encrypt SSL Certificate
 * This adds the /.well-known/acme-challenge endpoint to CBD Universal Database
 */

export class ACMEChallengeHandler {
    private challenges: Map<string, string> = new Map();

    /**
     * Add an ACME challenge
     */
    addChallenge(token: string, response: string): void {
        this.challenges.set(token, response);
        console.log(`🔐 ACME Challenge added: ${token} -> ${response.substring(0, 20)}...`);
    }

    /**
     * Remove an ACME challenge
     */
    removeChallenge(token: string): void {
        this.challenges.delete(token);
        console.log(`🗑️ ACME Challenge removed: ${token}`);
    }

    /**
     * Get challenge response
     */
    getChallenge(token: string): string | undefined {
        return this.challenges.get(token);
    }

    /**
     * Setup Express routes for ACME challenges
     */
    setupRoutes(app: any): void {
        // Create .well-known directory route
        app.get('/.well-known/acme-challenge/:token', (req: any, res: any) => {
            const token = req.params.token;
            const challenge = this.getChallenge(token);

            if (challenge) {
                console.log(`✅ ACME Challenge served: ${token}`);
                res.type('text/plain').send(challenge);
            } else {
                console.log(`❌ ACME Challenge not found: ${token}`);
                res.status(404).send('Challenge not found');
            }
        });

        console.log('🔐 ACME Challenge handler routes registered');
    }
}
