#!/bin/bash

# =============================================================================
# 🧪 CI/CD Test Verification Script
# =============================================================================

set -e

echo "🧪 Running CI/CD Test Verification..."
echo "====================================="

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Test results
TESTS_PASSED=0
TESTS_FAILED=0

# Function to run test and track results
run_test() {
    local test_name="$1"
    local test_command="$2"
    
    echo -e "${BLUE}🔍 Testing: $test_name${NC}"
    
    if eval "$test_command" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ PASS: $test_name${NC}"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}❌ FAIL: $test_name${NC}"
        ((TESTS_FAILED++))
    fi
}

# Test 1: Check if package.json files have test scripts
echo -e "${YELLOW}📦 Checking Package.json Test Scripts...${NC}"

run_test "Backend test script exists" "grep -q '\"test\"' backend/package.json"
run_test "Frontend test script exists" "grep -q '\"test\"' frontend/package.json"

# Test 2: Try running the test scripts
echo -e "${YELLOW}🧪 Running Test Scripts...${NC}"

run_test "Backend tests execute" "cd backend && npm test"
run_test "Frontend tests execute" "cd frontend && npm test"

# Test 3: Check if builds work
echo -e "${YELLOW}🏗️ Testing Build Scripts...${NC}"

run_test "Backend builds successfully" "cd backend && npm run build"
run_test "Frontend builds successfully" "cd frontend && npm run build"

# Test 4: Check GitHub Actions workflow
echo -e "${YELLOW}⚙️ Checking CI/CD Configuration...${NC}"

run_test "GitHub Actions workflow exists" "test -f .github/workflows/deploy.yml"
run_test "Workflow has test jobs" "grep -q 'npm test' .github/workflows/deploy.yml"
run_test "Workflow has deployment job" "grep -q 'deploy:' .github/workflows/deploy.yml"

# Test 5: Check deployment scripts
echo -e "${YELLOW}🚀 Checking Deployment Scripts...${NC}"

run_test "Advanced deployment script exists" "test -f deploy-advanced.sh"
run_test "Monitoring script exists" "test -f monitor.sh"
run_test "Scripts are executable" "test -x deploy-advanced.sh && test -x monitor.sh"

# Summary
echo ""
echo "==============================================="
echo -e "${BLUE}🏁 CI/CD Test Verification Summary${NC}"
echo "==============================================="

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 ALL TESTS PASSED! ($TESTS_PASSED/$((TESTS_PASSED + TESTS_FAILED)))${NC}"
    echo -e "${GREEN}✅ CI/CD pipeline is ready for deployment!${NC}"
    exit 0
else
    echo -e "${RED}⚠️  Some tests failed: $TESTS_FAILED failed, $TESTS_PASSED passed${NC}"
    echo -e "${YELLOW}🔧 Please fix the failing tests before deploying${NC}"
    exit 1
fi
