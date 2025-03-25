import axios from 'axios';
import { hash } from 'starknet';
import { AuthMessage, AuthToken, AuthTestResponse } from './auth/interfaces/auth.interface';

const API_URL = 'http://localhost:3000';

interface ErrorResponse {
    message: string;
    statusCode: number;
}

async function testAuthFlow() {
    try {
        // Step 1: Connect wallet
        console.log('\n=== Step 1: Connecting wallet ===');
        const walletAddress = '0x123...'; // Replace with actual wallet address
        console.log('Using wallet address:', walletAddress);
        
        const connectResponse = await axios.post<AuthMessage>(`${API_URL}/auth/connect`, {
            walletAddress
        });
        
        const { message, nonce } = connectResponse.data;
        console.log('\nGenerated authentication message:');
        console.log('-'.repeat(50));
        console.log(message);
        console.log('-'.repeat(50));

        // Step 2: Sign message (simulated for testing)
        console.log('\n=== Step 2: Signing message ===');
        // In a real scenario, this would be signed by the wallet
        const mockSignature = ['0x456...', '0x789...'];
        console.log('Generated signature:', mockSignature.join(', '));
        
        // Step 3: Verify signature and get token
        console.log('\n=== Step 3: Verifying signature ===');
        const verifyResponse = await axios.post<AuthToken>(`${API_URL}/auth/verify`, {
            walletAddress,
            signature: mockSignature,
            message
        });

        const { token } = verifyResponse.data;
        console.log('JWT token received successfully');
        console.log('Token:', token.substring(0, 50) + '...');
        
        // Step 4: Test protected endpoint
        console.log('\n=== Step 4: Testing protected endpoint ===');
        const protectedResponse = await axios.get<AuthTestResponse>(`${API_URL}/auth/test-auth`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        
        console.log('\nProtected endpoint response:');
        console.log('-'.repeat(50));
        console.log(JSON.stringify(protectedResponse.data, null, 4));
        console.log('-'.repeat(50));
        
        console.log('\n✅ Authentication flow completed successfully!');
    } catch (error: any) {
        console.error('\n❌ Error during authentication flow:');
        console.error('-'.repeat(50));
        
        const response = error?.response?.data;
        if (response) {
            console.error('Status:', error.response.status);
            console.error('Message:', response.message || error.message);
        } else {
            console.error('Error:', error.message);
        }
        
        console.error('-'.repeat(50));
        process.exit(1);
    }
}

testAuthFlow();
