# GOAT Platform - Greatest of All Time

A modern React frontend for the GOAT football platform featuring blockchain integration, referral networks, and trophy collection system.

![GOAT Platform](https://img.shields.io/badge/GOAT-Platform-gold)
![React](https://img.shields.io/badge/React-18.2.0-blue)
![Web3](https://img.shields.io/badge/Web3-Enabled-green)

## 🏆 Features

- **Blockchain Integration**: Connect with MetaMask, Trust Wallet, and other Web3 wallets
- **7 Trophy Levels**: From Pulcini to Serie A - climb the ranks and collect exclusive trophies
- **Referral System**: Build your network and earn bonuses from referrals
- **Return Calculator**: Earn up to 15% monthly returns based on deposit amounts
- **Modern UI**: Beautiful, responsive design with animations and glass morphism effects
- **Real-time Stats**: Dashboard with earnings, network growth, and activity tracking

## 🎯 Trophy Levels

1. **Pulcini** (< $10,000) - 8% monthly return
2. **Esordienti** ($10K - $20K) - 10% monthly return  
3. **Juniores** ($20K - $80K) - 12% monthly return
4. **Eccellenza** ($80K - $150K) - 12-15% monthly return
5. **Serie C** ($150K - $500K) - 15% monthly return
6. **Serie B** ($500K - $1.5M) - 15% monthly return
7. **Serie A** ($1.5M+) - 15% monthly return + GOAT status

## 🚀 Getting Started

### Prerequisites

- Node.js 16+ and npm
- MetaMask or compatible Web3 wallet
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/goat_frontend.git
cd goat_frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
npm run build
```

This creates an optimized production build in the `build` folder.

## 🏗️ Project Structure

```
src/
├── components/          # React components
│   ├── Home.js         # Landing page with features
│   ├── Dashboard.js    # User stats and overview
│   ├── Deposit.js      # Deposit form and calculator
│   ├── Referrals.js    # Network management
│   ├── Trophies.js     # Trophy collection
│   ├── Wallet.js       # Wallet management
│   └── Navbar.js       # Navigation bar
├── context/            # React context providers
│   └── WalletContext.js # Web3 wallet management
├── utils/              # Utility functions
│   └── platformUtils.js # Platform calculations
├── App.js              # Main app component
├── index.js            # Entry point
└── index.css           # Global styles
```

## 💰 How It Works

### Deposit Tiers & Returns
- **≤ $100**: 8% monthly return
- **$100 - $500**: 10% monthly return
- **$500 - $1,000**: 12% monthly return
- **> $1,000**: 15% monthly return

### Referral Bonuses
Players with 15% return rate earn the percentage difference from their referrals:
- If you have 15% and referral has 10%, you earn 5% bonus from their cashouts
- Build your network to increase rank and unlock higher returns

### Rank Progression
Network deposit thresholds for rank advancement:
- Pulcini to Esordienti: $10,000
- Esordienti to Juniores: $20,000
- Juniores to Eccellenza: $80,000
- Eccellenza to Serie C: $150,000
- Serie C to Serie B: $500,000
- Serie B to Serie A: $1,500,000

## 🎨 Technology Stack

- **Frontend**: React 18, React Router
- **Styling**: Tailwind CSS, Custom CSS animations
- **Web3**: Ethers.js for blockchain interaction
- **Icons**: Lucide React
- **Animations**: Framer Motion

## 🔧 Configuration

### Wallet Integration
The platform supports multiple wallet providers:
- MetaMask
- Trust Wallet
- WalletConnect compatible wallets

### Blockchain Networks
Currently configured for:
- Ethereum Mainnet
- BSC (Binance Smart Chain)
- Polygon
- Arbitrum

## 📱 Responsive Design

The platform is fully responsive and optimized for:
- Desktop computers
- Tablets
- Mobile devices

## 🎯 Key Components

### Dashboard
- Real-time statistics
- Earnings overview
- Network progress
- Recent activity

### Deposit System
- Amount validation
- Return calculation
- Tier visualization
- Transaction processing

### Referral Network
- Referral code generation
- Network visualization
- Bonus calculations
- Sharing tools

### Trophy Collection
- 7 unique trophy levels
- Achievement system
- Progress tracking
- Unlock animations

## 🔐 Security Features

- Wallet connection validation
- Transaction confirmation
- Input sanitization
- Error handling

## 🌟 Future Enhancements

- [ ] Multi-language support
- [ ] Mobile app development
- [ ] Advanced analytics
- [ ] Social features
- [ ] NFT integration
- [ ] Staking mechanisms

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and questions:
- Email: support@goat-platform.com
- Discord: [GOAT Community](https://discord.gg/goat)
- Twitter: [@GOATPlatform](https://twitter.com/GOATPlatform)

## ⚠️ Disclaimer

This is a frontend interface for demonstration purposes. Always ensure you understand the risks involved with cryptocurrency investments and only invest what you can afford to lose.

---

**GOAT Platform** - Where Champions Are Made 🏆
