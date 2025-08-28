# 🔧 WalletConnect Configuration Guide

## ❌ **ERRORE: "Invalid App Configuration"**

Questo errore indica che WalletConnect non è configurato correttamente. Segui questa guida per risolverlo.

---

## **📋 STEP-BY-STEP SETUP**

### **1. Crea Account WalletConnect (GRATUITO)**
```bash
🌐 Vai su: https://cloud.walletconnect.com
📧 Registrati con email (gratuito)
✅ Verifica la tua email
```

### **2. Crea Nuovo Progetto**
```bash
➕ Click "Create" o "New Project"
📝 Nome: GOAT Platform
📝 Descrizione: Greatest of All Time - Football DeFi Platform
🌐 URL: http://localhost:3000 (per sviluppo)
💾 Salva il progetto
```

### **3. Copia Project ID**
```bash
📋 Vai nella dashboard del progetto
🔑 Trova il "Project ID" (stringa lunga tipo: 2f05a7b...)
📝 Copialo negli appunti
```

### **4. Crea File .env**
```bash
# Nella cartella goat_fronted, crea il file .env:

REACT_APP_BACKEND_URL=http://localhost:3001
REACT_APP_BSC_MAINNET_RPC=https://bsc-dataseed.binance.org
REACT_APP_BSC_TESTNET_RPC=https://data-seed-prebsc-1-s1.binance.org:8545
REACT_APP_BSC_MAINNET_CHAIN_ID=56
REACT_APP_BSC_TESTNET_CHAIN_ID=97
REACT_APP_USDT_BSC_MAINNET=0x55d398326f99059fF775485246999027B3197955
REACT_APP_USDT_BSC_TESTNET=0x4bC3A5ae91ab34380464DBD17233178fbB861AC0

# 🔑 SOSTITUISCI CON IL TUO PROJECT ID:
REACT_APP_WALLETCONNECT_PROJECT_ID=IL-TUO-PROJECT-ID-QUI

REACT_APP_ENABLE_DEV_TOOLS=true
REACT_APP_DEFAULT_NETWORK=testnet
```

### **5. Restart Applicazione**
```bash
# Ferma il server (Ctrl+C) e riavvia:
npm start

# O se stai usando yarn:
yarn start
```

---

## **🎯 CONFIGURAZIONE PROGETTO WALLETCONNECT**

### **Impostazioni Consigliate:**
```bash
📛 Name: GOAT Platform
📄 Description: Greatest of All Time - Football DeFi Platform  
🌐 Homepage: https://tuodominio.com (o http://localhost:3000 per dev)
🖼️ Icon: Upload del logo GOAT
🔗 Allowed Origins: 
   - http://localhost:3000
   - http://localhost:3001  
   - https://tuodominio.com (se hai un dominio)
```

### **Chains Supportate:**
```bash
✅ Binance Smart Chain (56)
✅ BSC Testnet (97)
```

---

## **🧪 COME TESTARE**

### **Test 1: Verifica Configurazione**
```bash
1. ✅ File .env creato con Project ID
2. ✅ Server riavviato (npm start)
3. ✅ Click "Connect Wallet" 
4. ✅ WalletConnect non mostra più errore "Invalid App Configuration"
```

### **Test 2: Connessione Mobile**
```bash
1. 📱 Installa Trust Wallet o Rainbow su mobile
2. 🔗 Click "WalletConnect" nell'app GOAT
3. 📷 Scansiona QR code con wallet mobile
4. ✅ Dovrebbe connettersi correttamente
```

---

## **❗ TROUBLESHOOTING**

### **Errore: "Invalid Project ID"**
```bash
🔍 Problema: Project ID sbagliato o non esistente
✅ Soluzione: 
   1. Verifica di aver copiato tutto il Project ID
   2. Controlla che non ci siano spazi extra
   3. Assicurati che il progetto WalletConnect sia attivo
```

### **Errore: "Unauthorized domain"**
```bash
🔍 Problema: Dominio non autorizzato nel progetto WalletConnect
✅ Soluzione:
   1. Vai nel progetto WalletConnect Cloud
   2. Aggiungi "http://localhost:3000" negli Allowed Origins
   3. Salva le modifiche
```

### **QR Code non appare**
```bash
🔍 Problema: Modalità QR disabilitata o errore init
✅ Soluzione:
   1. Verifica che showQrModal: true nel codice
   2. Controlla console browser per errori
   3. Prova a ricaricare la pagina
```

---

## **🎉 RISULTATO ATTESO**

Dopo la configurazione corretta:

✅ **No più errori "Invalid App Configuration"**  
✅ **Modal con MetaMask + WalletConnect funzionanti**  
✅ **QR Code appare per connessione mobile**  
✅ **300+ wallet supportati tramite WalletConnect**  
✅ **Cross-platform: Desktop + Mobile**  

---

## **📞 SUPPORTO**

Se hai ancora problemi:

1. **Console Logs**: Controlla F12 → Console per errori
2. **WalletConnect Status**: Verifica su https://status.walletconnect.com
3. **Project Settings**: Ricontrolla configurazione progetto WalletConnect

**Una volta configurato, WalletConnect funzionerà perfettamente!** 🚀
