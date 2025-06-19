#!/bin/bash

# =============================================================================
# 📊 Omyra Project Management - Server Monitoring Script
# =============================================================================

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# System information
print_header() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}🖥️  Omyra PMS - Server Monitoring${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo -e "${CYAN}Time:${NC} $(date)"
    echo -e "${CYAN}Hostname:${NC} $(hostname)"
    echo -e "${CYAN}Uptime:${NC} $(uptime -p)"
    echo ""
}

# System resources
check_system_resources() {
    echo -e "${PURPLE}💻 System Resources${NC}"
    echo "------------------------"
    
    # CPU Usage
    cpu_usage=$(top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{print 100 - $1}')
    echo -e "${CYAN}CPU Usage:${NC} ${cpu_usage}%"
    
    # Memory Usage
    mem_info=$(free -h | grep '^Mem')
    mem_total=$(echo $mem_info | awk '{print $2}')
    mem_used=$(echo $mem_info | awk '{print $3}')
    mem_percent=$(free | grep '^Mem' | awk '{printf "%.1f", $3/$2 * 100.0}')
    echo -e "${CYAN}Memory:${NC} ${mem_used}/${mem_total} (${mem_percent}%)"
    
    # Disk Usage
    disk_usage=$(df -h / | awk 'NR==2{printf "%s/%s (%s)", $3,$2,$5}')
    echo -e "${CYAN}Disk Usage:${NC} ${disk_usage}"
    
    # Load Average
    load_avg=$(uptime | awk -F'load average:' '{print $2}')
    echo -e "${CYAN}Load Average:${NC}${load_avg}"
    
    echo ""
}

# Docker containers status
check_docker_status() {
    echo -e "${PURPLE}🐳 Docker Containers${NC}"
    echo "------------------------"
    
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}❌ Docker not installed${NC}"
        return
    fi
    
    if ! docker info &> /dev/null; then
        echo -e "${RED}❌ Docker not running${NC}"
        return
    fi
    
    # Container status
    containers=$(docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -v NAMES)
    if [ -n "$containers" ]; then
        echo -e "${GREEN}✅ Running Containers:${NC}"
        echo "$containers"
    else
        echo -e "${YELLOW}⚠️  No running containers${NC}"
    fi
    
    echo ""
    
    # Resource usage
    echo -e "${CYAN}Container Resource Usage:${NC}"
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}" 2>/dev/null || echo "No containers running"
    
    echo ""
}

# Application health checks
check_application_health() {
    echo -e "${PURPLE}🏥 Application Health${NC}"
    echo "------------------------"
    
    # Backend health check
    echo -e "${CYAN}Backend Health:${NC}"
    if curl -f -k -s https://localhost/health > /dev/null 2>&1; then
        health_response=$(curl -k -s https://localhost/health)
        echo -e "${GREEN}✅ Backend is healthy${NC}"
        echo "   Response: $health_response"
    else
        echo -e "${RED}❌ Backend health check failed${NC}"
    fi
    
    # Frontend check
    echo -e "${CYAN}Frontend:${NC}"
    if curl -f -k -s -I https://localhost | grep -q "200 OK"; then
        echo -e "${GREEN}✅ Frontend is accessible${NC}"
    else
        echo -e "${RED}❌ Frontend is not accessible${NC}"
    fi
    
    # Database check
    echo -e "${CYAN}Database:${NC}"
    if docker exec omyra-project_management-mongodb-1 mongosh --eval "db.adminCommand('ping')" &> /dev/null; then
        echo -e "${GREEN}✅ Database is responsive${NC}"
    else
        echo -e "${RED}❌ Database connection failed${NC}"
    fi
    
    echo ""
}

# Network connectivity
check_network() {
    echo -e "${PURPLE}🌐 Network Connectivity${NC}"
    echo "------------------------"
    
    # Check internet connectivity
    if ping -c 1 8.8.8.8 &> /dev/null; then
        echo -e "${GREEN}✅ Internet connectivity${NC}"
    else
        echo -e "${RED}❌ No internet connectivity${NC}"
    fi
    
    # Check domain resolution
    if nslookup pms.omyratech.com &> /dev/null; then
        echo -e "${GREEN}✅ Domain resolution working${NC}"
    else
        echo -e "${YELLOW}⚠️  Domain resolution issues${NC}"
    fi
    
    # Check port availability
    ports=("80" "443" "22")
    for port in "${ports[@]}"; do
        if netstat -ln | grep ":$port " &> /dev/null; then
            echo -e "${GREEN}✅ Port $port is open${NC}"
        else
            echo -e "${YELLOW}⚠️  Port $port is not listening${NC}"
        fi
    done
    
    echo ""
}

# SSL certificate status
check_ssl_certificates() {
    echo -e "${PURPLE}🔐 SSL Certificates${NC}"
    echo "------------------------"
    
    if [ -f "ssl/certs/server.crt" ]; then
        # Check certificate expiration
        exp_date=$(openssl x509 -in ssl/certs/server.crt -noout -enddate | cut -d= -f2)
        exp_epoch=$(date -d "$exp_date" +%s)
        current_epoch=$(date +%s)
        days_until_exp=$(( (exp_epoch - current_epoch) / 86400 ))
        
        if [ $days_until_exp -gt 30 ]; then
            echo -e "${GREEN}✅ SSL certificate valid (expires in $days_until_exp days)${NC}"
        elif [ $days_until_exp -gt 0 ]; then
            echo -e "${YELLOW}⚠️  SSL certificate expires in $days_until_exp days${NC}"
        else
            echo -e "${RED}❌ SSL certificate has expired${NC}"
        fi
        
        # Certificate details
        subject=$(openssl x509 -in ssl/certs/server.crt -noout -subject | cut -d= -f2-)
        echo -e "${CYAN}   Subject:${NC} $subject"
    else
        echo -e "${RED}❌ SSL certificate not found${NC}"
    fi
    
    echo ""
}

# Log analysis
check_logs() {
    echo -e "${PURPLE}📋 Recent Logs${NC}"
    echo "------------------------"
    
    # System logs
    echo -e "${CYAN}System Errors (last 5):${NC}"
    journalctl --since "1 hour ago" -p err --no-pager -n 5 2>/dev/null || echo "No recent system errors"
    
    echo ""
    
    # Docker logs
    if docker ps -q | grep -q .; then
        echo -e "${CYAN}Application Errors (last 10):${NC}"
        docker compose -f docker-compose.production.yml logs --tail=10 2>/dev/null | grep -i error | tail -5 || echo "No recent application errors"
    fi
    
    echo ""
}

# Security status
check_security() {
    echo -e "${PURPLE}🔒 Security Status${NC}"
    echo "------------------------"
    
    # Check for failed login attempts
    failed_logins=$(journalctl --since "1 hour ago" | grep -i "failed" | grep -i "login" | wc -l)
    if [ $failed_logins -gt 0 ]; then
        echo -e "${YELLOW}⚠️  $failed_logins failed login attempts in last hour${NC}"
    else
        echo -e "${GREEN}✅ No failed login attempts${NC}"
    fi
    
    # Check firewall status
    if command -v ufw &> /dev/null; then
        ufw_status=$(ufw status | head -1)
        if echo "$ufw_status" | grep -q "active"; then
            echo -e "${GREEN}✅ Firewall is active${NC}"
        else
            echo -e "${YELLOW}⚠️  Firewall is not active${NC}"
        fi
    fi
    
    # Check for suspicious processes
    suspicious_procs=$(ps aux | grep -E "(bitcoin|mine|crypto)" | grep -v grep | wc -l)
    if [ $suspicious_procs -gt 0 ]; then
        echo -e "${RED}❌ Suspicious processes detected${NC}"
    else
        echo -e "${GREEN}✅ No suspicious processes${NC}"
    fi
    
    echo ""
}

# Performance metrics
show_performance_metrics() {
    echo -e "${PURPLE}📊 Performance Metrics${NC}"
    echo "------------------------"
    
    # Response time test
    echo -e "${CYAN}Response Time Test:${NC}"
    response_time=$(curl -k -s -w "%{time_total}" -o /dev/null https://localhost/health 2>/dev/null || echo "failed")
    if [ "$response_time" != "failed" ]; then
        response_ms=$(echo "$response_time * 1000" | bc -l | cut -d. -f1)
        if [ $response_ms -lt 1000 ]; then
            echo -e "${GREEN}✅ Response time: ${response_ms}ms${NC}"
        else
            echo -e "${YELLOW}⚠️  Response time: ${response_ms}ms (slow)${NC}"
        fi
    else
        echo -e "${RED}❌ Response time test failed${NC}"
    fi
    
    # Database connection time
    if docker ps | grep -q mongodb; then
        echo -e "${CYAN}Database Performance:${NC}"
        db_time=$(docker exec omyra-project_management-mongodb-1 mongosh --eval "var start = new Date(); db.adminCommand('ping'); print((new Date() - start) + 'ms')" 2>/dev/null | tail -1)
        echo -e "   Connection time: $db_time"
    fi
    
    echo ""
}

# Alerts and recommendations
show_alerts() {
    echo -e "${PURPLE}🚨 Alerts & Recommendations${NC}"
    echo "------------------------"
    
    alerts=()
    
    # Check disk space
    disk_percent=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
    if [ $disk_percent -gt 80 ]; then
        alerts+=("❌ Disk usage is high (${disk_percent}%)")
    fi
    
    # Check memory usage
    mem_percent=$(free | grep '^Mem' | awk '{printf "%.0f", $3/$2 * 100.0}')
    if [ $mem_percent -gt 85 ]; then
        alerts+=("❌ Memory usage is high (${mem_percent}%)")
    fi
    
    # Check load average
    load_5min=$(uptime | awk -F'load average:' '{print $2}' | awk -F',' '{print $2}' | tr -d ' ')
    if (( $(echo "$load_5min > 2.0" | bc -l) )); then
        alerts+=("❌ High system load (${load_5min})")
    fi
    
    # Display alerts
    if [ ${#alerts[@]} -eq 0 ]; then
        echo -e "${GREEN}✅ No critical alerts${NC}"
    else
        for alert in "${alerts[@]}"; do
            echo -e "$alert"
        done
    fi
    
    echo ""
}

# Summary report
generate_summary() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}📋 Monitoring Summary${NC}"
    echo -e "${BLUE}========================================${NC}"
    
    # Overall health score
    score=0
    max_score=8
    
    # Check various components
    curl -f -k -s https://localhost/health > /dev/null 2>&1 && ((score++))
    curl -f -k -s -I https://localhost | grep -q "200 OK" && ((score++))
    docker exec omyra-project_management-mongodb-1 mongosh --eval "db.adminCommand('ping')" &> /dev/null && ((score++))
    docker ps | grep -q "omyra-project_management" && ((score++))
    [ -f "ssl/certs/server.crt" ] && ((score++))
    ping -c 1 8.8.8.8 &> /dev/null && ((score++))
    [ $(df / | tail -1 | awk '{print $5}' | sed 's/%//') -lt 80 ] && ((score++))
    [ $(free | grep '^Mem' | awk '{printf "%.0f", $3/$2 * 100.0}') -lt 85 ] && ((score++))
    
    health_percent=$((score * 100 / max_score))
    
    if [ $health_percent -ge 90 ]; then
        status_color=$GREEN
        status_emoji="🟢"
        status_text="EXCELLENT"
    elif [ $health_percent -ge 70 ]; then
        status_color=$YELLOW
        status_emoji="🟡"
        status_text="GOOD"
    else
        status_color=$RED
        status_emoji="🔴"
        status_text="NEEDS ATTENTION"
    fi
    
    echo -e "${CYAN}Overall Health:${NC} ${status_color}${status_emoji} ${status_text} (${health_percent}%)${NC}"
    echo -e "${CYAN}Checks Passed:${NC} ${score}/${max_score}"
    echo ""
    
    # Quick actions
    echo -e "${CYAN}Quick Actions:${NC}"
    echo "  View logs:      ./monitor.sh logs"
    echo "  Full check:     ./monitor.sh full"
    echo "  Restart app:    ./deploy-advanced.sh restart"
    echo "  Deploy latest:  ./deploy-advanced.sh deploy"
}

# Main function
main() {
    case "${1:-summary}" in
        "full")
            print_header
            check_system_resources
            check_docker_status
            check_application_health
            check_network
            check_ssl_certificates
            check_security
            show_performance_metrics
            check_logs
            show_alerts
            generate_summary
            ;;
        "health")
            check_application_health
            ;;
        "resources")
            check_system_resources
            ;;
        "docker")
            check_docker_status
            ;;
        "network")
            check_network
            ;;
        "ssl")
            check_ssl_certificates
            ;;
        "security")
            check_security
            ;;
        "logs")
            check_logs
            ;;
        "alerts")
            show_alerts
            ;;
        "performance")
            show_performance_metrics
            ;;
        "summary"|*)
            print_header
            generate_summary
            ;;
    esac
}

# Run with arguments
main "$@"
