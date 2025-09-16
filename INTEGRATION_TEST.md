# Integration Test Guide

This document outlines how to test the minimal Conflux Dual Wallet Demo.

## 🧪 Test Scenarios

### 1. Server Health Check

```bash
# Test server is running
curl http://localhost:3001/health

# Expected response:
# {"status":"healthy","timestamp":"...","service":"minimal-contract-server"}
```

### 2. Contract Status

```bash
# Test contract status endpoint
curl http://localhost:3001/api/contracts/status

# Expected response:
# {"success":true,"data":{"espace":{"deployed":true,"address":"...","mock":true},"core":{"deployed":false,"address":null,"mock":false}}}
```

### 3. Counter Operations

```bash
# Test counter status
curl http://localhost:3001/api/contracts/counter/status

# Test counter add operation
curl -X POST http://localhost:3001/api/contracts/counter/operation \
  -H "Content-Type: application/json" \
  -d '{"operation": "add", "value": 10}'

# Test counter reset
curl -X POST http://localhost:3001/api/contracts/counter/operation \
  -H "Content-Type: application/json" \
  -d '{"operation": "reset"}'
```

### 4. Frontend Testing

1. **Open Browser**: Navigate to http://localhost:3000
2. **Test Pattern A**:
   - Click "Try Pattern A"
   - Verify contract status is displayed
   - Test counter operations (add, subtract, multiply, divide)
   - Test quick actions (+1, +10, +100, ×2, ÷2, Reset)
   - Test batch operations

3. **Test Pattern B**:
   - Click "Try Pattern B"
   - Verify contract status is displayed
   - Test delegation wizard:
     - Click "Create Delegation"
     - Fill in delegate address
     - Set spending limit
     - Confirm and create
   - Test counter operations
   - Verify delegation appears in list

### 5. Error Handling

Test error scenarios:

```bash
# Test invalid counter operation
curl -X POST http://localhost:3001/api/contracts/counter/operation \
  -H "Content-Type: application/json" \
  -d '{"operation": "invalid"}'

# Test missing required fields
curl -X POST http://localhost:3001/api/contracts/counter/operation \
  -H "Content-Type: application/json" \
  -d '{}'
```

## 🔍 Verification Checklist

### Server Component
- [ ] Server starts without errors
- [ ] Health endpoint responds correctly
- [ ] Contract status endpoint works
- [ ] Counter operations work
- [ ] Error handling works
- [ ] CORS is configured
- [ ] Rate limiting is active

### Frontend Component
- [ ] React app starts without errors
- [ ] Home page loads correctly
- [ ] Pattern A page loads and functions
- [ ] Pattern B page loads and functions
- [ ] Delegation wizard works
- [ ] Counter operations work
- [ ] Error messages display correctly
- [ ] Responsive design works

### Integration
- [ ] Frontend can communicate with server
- [ ] API calls work from browser
- [ ] Error handling works end-to-end
- [ ] All features work together

## 🐛 Troubleshooting

### Common Issues

1. **Server won't start**
   - Check if port 3001 is available
   - Verify dependencies are installed
   - Check logs in `logs/server.log`

2. **Frontend won't start**
   - Check if port 3000 is available
   - Verify dependencies are installed
   - Check logs in `logs/frontend.log`

3. **API calls fail**
   - Verify server is running
   - Check CORS configuration
   - Verify API endpoints are correct

4. **Counter operations fail**
   - Check if contracts are deployed
   - Verify contract addresses
   - Check server logs for errors

### Debug Commands

```bash
# Check running processes
ps aux | grep node

# Check port usage
netstat -tlnp | grep :3000
netstat -tlnp | grep :3001

# Check logs
tail -f logs/server.log
tail -f logs/frontend.log

# Test API endpoints
curl -v http://localhost:3001/health
```

## 📊 Performance Testing

### Load Testing

```bash
# Test server under load
for i in {1..100}; do
  curl -s http://localhost:3001/health > /dev/null &
done
wait

# Test counter operations under load
for i in {1..50}; do
  curl -s -X POST http://localhost:3001/api/contracts/counter/operation \
    -H "Content-Type: application/json" \
    -d '{"operation": "add", "value": 1}' > /dev/null &
done
wait
```

### Memory Usage

```bash
# Monitor memory usage
ps aux | grep node | awk '{print $2, $4, $6, $11}'
```

## ✅ Success Criteria

The integration test is successful when:

1. All services start without errors
2. All API endpoints respond correctly
3. Frontend loads and functions properly
4. Counter operations work in both patterns
5. Delegation wizard works in Pattern B
6. Error handling works throughout
7. Performance is acceptable
8. No memory leaks or crashes

## 🚀 Next Steps

After successful integration testing:

1. Deploy to staging environment
2. Run automated tests
3. Performance optimization
4. Security review
5. Production deployment

