"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const API_URL = 'http://localhost:3000';
function testAuthFlow() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            // Step 1: Connect wallet
            console.log('\n=== Step 1: Connecting wallet ===');
            const walletAddress = '0x123...'; // Replace with actual wallet address
            console.log('Using wallet address:', walletAddress);
            const connectResponse = yield axios_1.default.post(`${API_URL}/auth/connect`, {
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
            const verifyResponse = yield axios_1.default.post(`${API_URL}/auth/verify`, {
                walletAddress,
                signature: mockSignature,
                message
            });
            const { token } = verifyResponse.data;
            console.log('JWT token received successfully');
            console.log('Token:', token.substring(0, 50) + '...');
            // Step 4: Test protected endpoint
            console.log('\n=== Step 4: Testing protected endpoint ===');
            const protectedResponse = yield axios_1.default.get(`${API_URL}/auth/test-auth`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            console.log('\nProtected endpoint response:');
            console.log('-'.repeat(50));
            console.log(JSON.stringify(protectedResponse.data, null, 4));
            console.log('-'.repeat(50));
            console.log('\n✅ Authentication flow completed successfully!');
        }
        catch (error) {
            console.error('\n❌ Error during authentication flow:');
            console.error('-'.repeat(50));
            const response = (_a = error === null || error === void 0 ? void 0 : error.response) === null || _a === void 0 ? void 0 : _a.data;
            if (response) {
                console.error('Status:', error.response.status);
                console.error('Message:', response.message || error.message);
            }
            else {
                console.error('Error:', error.message);
            }
            console.error('-'.repeat(50));
            process.exit(1);
        }
    });
}
testAuthFlow();
