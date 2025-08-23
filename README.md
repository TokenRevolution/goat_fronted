# GOAT Platform - Greatest of All Time

A modern React frontend for the GOAT football platform featuring blockchain integration, referral networks, and trophy collection system.

![GOAT Platform](https://img.shields.io/badge/GOAT-Platform-gold)
![React](https://img.shields.io/badge/React-18.2.0-blue)
![Web3](https://img.shields.io/badge/Web3-Enabled-green)

## 🏆 Features

- **Blockchain Integration**: Connect with MetaMask, Trust Wallet, and other Web3 wallets
- **7 Trophy Levels**: From "Nuovo" to Serie A - climb the ranks and collect exclusive trophies
- **Referral System**: Build your network and earn bonuses from referrals
- **Return Calculator**: Earn up to 16% monthly returns (15% base + 1% Instagram bonus)
- **Modern UI**: Beautiful, responsive design with animations and glass morphism effects
- **Real-time Stats**: Dashboard with earnings, network growth, and activity tracking
- **Enhanced Dashboard**: Modern UI with comprehensive statistics and cashout system
- **Daily Returns Accumulation**: Automatic daily profit calculation and display
- **Cashout System**: Request withdrawals with midnight payment processing

## 🎯 Trophy Levels

0. **Nuovo** (< $5K Network + $0 Personal) - Entry level
1. **Pulcini** ($5K-$10K Network + $1K Personal) - 8% base (9% con Instagram bonus) + **🎁 Carta WeFi Gratuita**
2. **Esordienti** ($10K-$20K Network + $3K Personal) - 10% base (11% con Instagram bonus)
3. **Juniores** ($20K-$80K Network + $10K Personal) - 12% base (13% con Instagram bonus)
4. **Eccellenza** ($80K-$150K Network + $15K Personal) - 12-15% base (13-16% con Instagram bonus)
5. **Serie C** ($150K-$500K Network + $25K Personal) - 15% base (16% con Instagram bonus)
6. **Serie B** ($500K-$1.5M Network + $50K Personal) - 15% base (16% con Instagram bonus)
7. **Serie A** ($1.5M+ Network + $100K Personal) - 15% base (16% con Instagram bonus) + GOAT status

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
│   ├── Dashboard.js    # Enhanced user stats and cashout system
│   ├── Deposit.js      # Deposit form and calculator
│   ├── Referrals.js    # Network management
│   ├── Trophies.js     # Trophy collection
│   ├── Wallet.js       # Wallet management
│   └── Navbar.js       # Navigation bar
├── context/            # React context providers
│   └── WalletContext.js # Web3 wallet management
├── utils/              # Utility functions
│   └── platformUtils.js # Platform calculations and daily returns
├── App.js              # Main app component
├── index.js            # Entry point
└── index.css           # Global styles
```

## 📊 Dashboard Features

### **Enhanced Statistics Grid**
- **6 Key Metrics**: Personal deposits, monthly/daily earnings, accumulated returns, referrals, network value
- **Interactive Cards**: Hover effects, color-coded borders, and smooth animations
- **Real-time Updates**: Live data display with responsive design

### **Cashout System**
- **Available Earnings**: Clear display of accumulated daily returns
- **Pending Payments**: Track requested cashouts and processing status
- **Payment Timing**: Automatic midnight processing after cashout request
- **Transaction History**: Complete log of all cashout activities

### **Network Overview**
- **Referral Statistics**: Direct and indirect network members
- **Progress Tracking**: Visual progress bars for rank advancement
- **Reward Information**: Clear display of next rank requirements and WeFi card rewards

### **Activity Monitoring**
- **Recent Transactions**: Detailed log with timestamps and status indicators
- **Visual Indicators**: Color-coded activity types and completion status
- **Time Tracking**: Date and time for each activity entry

## 💰 How It Works

### Deposit Tiers & Returns
- **≤ $100**: 8% base (9% con Instagram bonus)
- **$100 - $500**: 10% base (11% con Instagram bonus)
- **$500 - $1,000**: 12% base (13% con Instagram bonus)
- **> $1,000**: 15% base (16% con Instagram bonus)

### Payment System
- **Rendimenti giornalieri**: I profitti maturano quotidianamente
- **Accumulo automatico**: I rendimenti si accumulano fino al cashout
- **Pagamenti**: Eseguiti a mezzanotte dopo la richiesta di cashout
- **Modalità**: Richiesta manuale dell'utente tramite interfaccia

### Platform Development Support
- **Donazione opzionale**: 0.5% di ogni deposito
- **Finalità**: Supporto allo sviluppo continuo della piattaforma
- **Modalità**: Checkbox durante il deposito

### Instagram Bonus (+1%)
Segui quotidianamente @seeker_insearchofurtune su Instagram:
- **Like** ai post giornalieri
- **Commenta** in modo significativo
- Ricevi **+1% bonus** sui tuoi rendimenti mensili

### Referral Bonuses
Players with 15% return rate earn the percentage difference from their referrals:
- If you have 15% and referral has 10%, you earn 5% bonus from their cashouts
- Build your network to increase rank and unlock higher returns

### Carta WeFi Reward
Al raggiungimento del **rank Pulcini** ($5,000 - $10,000 network deposits + $1,000 deposito personale):
- **🎁 Carta WeFi decentralizzata gratuita**
- Supporta reti **BNB, ETH, TRX** e altre blockchain
- Accesso a funzionalità premium
- Reward esclusivo per i primi GOAT

### Rank Progression
Requisiti per avanzamento di rank (Network + Deposito Personale):
- **Nuovo to Pulcini**: $5K Network + $1K Personal (🎁 Ottieni Carta WeFi)
- **Pulcini to Esordienti**: $10K Network + $3K Personal
- **Esordienti to Juniores**: $20K Network + $10K Personal
- **Juniores to Eccellenza**: $80K Network + $15K Personal
- **Eccellenza to Serie C**: $150K Network + $25K Personal
- **Serie C to Serie B**: $500K Network + $50K Personal
- **Serie B to Serie A**: $1.5M Network + $100K Personal

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
