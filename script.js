cat << 'EOF' > script.js
function calculate() {
    const area = parseFloat(document.getElementById('area').value) || 0;
    const cost = parseFloat(document.getElementById('cost').value) || 0;
    const yieldPerHa = parseFloat(document.getElementById('yield').value) || 0;
    const price = parseFloat(document.getElementById('price').value) || 0;

    const totalRevenue = area * yieldPerHa * price;
    const totalCost = area * cost;
    const profit = totalRevenue - totalCost;

    document.getElementById('result').innerText = `Чистая прибыль: ${profit.toLocaleString()} (Выручка: ${totalRevenue.toLocaleString()})`;
}
EOF
