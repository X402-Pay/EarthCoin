let userAddress = null;
let hasEarth = false;
let messages = JSON.parse(localStorage.getItem('earthChat')) || [];
let points = JSON.parse(localStorage.getItem('earthPoints')) || [];

// === 3D 地球优化：高清纹理 + 夜光城市 + 光照 ===
const globe = Globe()
    (document.getElementById('globeContainer'))
    .globeImageUrl('https://unpkg.com/three-globe/example/img/earth-day.jpg')
    .bumpImageUrl('https://unpkg.com/three-globe/example/img/earth-topology.png')
    .backgroundImageUrl('https://unpkg.com/three-globe/example/img/night-sky.png')
    .showAtmosphere(true)
    .atmosphereColor('#3a228a')
    .atmosphereAltitude(0.25)
    .pointsData(points.map(p => ({ lat: p.lat, lng: p.lng, size: 0.15, color: '#00ff88' })))
    .pointAltitude(0.01)
    .pointColor(() => '#00ff88')
    .pointGlow(true);

// 点击点亮
globe.onPointClick = (point) => {
    if (!hasEarth) {
        alert('Hold $EARTH to conquer this land!');
        return;
    }
    const newPoint = { lat: point.lat, lng: point.lng };
    points.push(newPoint);
    localStorage.setItem('earthPoints', JSON.stringify(points));
    globe.pointsData(points.map(p => ({ lat: p.lat, lng: p.lng, size: 0.15, color: '#00ff88' })));
    alert(`Conquered! ${point.lat.toFixed(2)}°, ${point.lng.toFixed(2)}°`);
};

// === 钱包连接（右上角）===
document.getElementById('walletBtn').addEventListener('click', async () => {
    if (!window.solana) {
        alert('Please install Phantom Wallet!');
        return;
    }
    try {
        await window.solana.connect();
        userAddress = window.solana.publicKey.toString();
        document.getElementById('walletStatus').textContent = userAddress.slice(0, 4) + '...' + userAddress.slice(-4);
        document.getElementById('walletStatus').style.display = 'block';
        
        // === 持币检查（demo: 假设持有）===
        hasEarth = true; // 实际替换为你的 token mint 检查
        // const connection = new solanaWeb3.Connection(solanaWeb3.clusterApiUrl('mainnet-beta'));
        // const mint = new solanaWeb3.PublicKey('YOUR_EARTHCOIN_MINT');
        // const accounts = await connection.getTokenAccountsByOwner(new solanaWeb3.PublicKey(userAddress), { mint });
        // hasEarth = accounts.value.some(acc => acc.account.data.parsed.info.tokenAmount.uiAmount > 0);

        if (hasEarth) {
            document.getElementById('messageInput').disabled = false;
            document.getElementById('sendBtn').disabled = false;
        }
    } catch (err) {
        console.error(err);
    }
});

// === 聊天系统 ===
function renderMessages() {
    const container = document.getElementById('messages');
    container.innerHTML = messages.map(msg => 
        `<p><strong>${msg.user}</strong>: ${msg.text}</p>`
    ).join('');
    container.scrollTop = container.scrollHeight;
}

document.getElementById('sendBtn').addEventListener('click', sendMessage);
document.getElementById('messageInput').addEventListener('keypress', e => {
    if (e.key === 'Enter') sendMessage();
});

async function sendMessage() {
    const input = document.getElementById('messageInput');
    const text = input.value.trim();
    if (!text || !userAddress) return;
    
    const user = userAddress.slice(0, 4) + '..' + userAddress.slice(-2);
    messages.push({ user, text, time: new Date().toLocaleTimeString() });
    localStorage.setItem('earthChat', JSON.stringify(messages));
    input.value = '';
    renderMessages();
}

// 轮询更新（模拟实时）
setInterval(() => {
    const saved = JSON.parse(localStorage.getItem('earthChat') || '[]');
    if (saved.length !== messages.length) {
        messages = saved;
        renderMessages();
    }
}, 2000);

// 初始化
renderMessages();
