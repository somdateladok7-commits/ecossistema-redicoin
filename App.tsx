import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { useMockData } from './hooks/useMockData';
import type { View, Contact } from './types';
import { Painel } from './components/Painel';
import { Reputacao } from './components/Reputacao';
import { Sobre } from './components/Sobre';
import { WalletConnectModal } from './components/WalletConnectModal';
import { Toast } from './components/Toast';
import { StakeModal } from './components/StakeModal';
import { TransferModal } from './components/TransferModal';
import { AddContactModal } from './components/AddContactModal';

const initialContacts: Contact[] = [
    { id: 1, name: 'Ana Clara', username: 'ana.rc', address: '0x1A2b3c4D5e6F7g8H9i0J1k2L3m4N5o6P7q8R9s0T', imageUrl: 'https://i.pravatar.cc/150?img=1', type: 'pessoa' },
    { id: 2, name: 'Bruno Alves', username: 'bruno.rc', address: '0x2B3c4D5e6F7g8H9i0J1k2L3m4N5o6P7q8R9s0T1A', imageUrl: 'https://i.pravatar.cc/150?img=2', type: 'pessoa' },
    { id: 3, name: 'Design Co.', username: 'designco.rc', address: '0x3C4d5E6f7G8h9I0j1K2l3M4n5O6p7Q8r9S0t1A2b', imageUrl: 'https://i.pravatar.cc/150?img=30', type: 'empresa' },
    { id: 4, name: 'Daniel Souza', username: 'daniel.rc', address: '0x4D5e6F7g8H9i0J1k2L3m4N5o6P7q8R9s0T1a2B3c', imageUrl: 'https://i.pravatar.cc/150?img=4', type: 'pessoa' },
];

const CONTACTS_STORAGE_KEY = 'redicoin_contacts';


const App: React.FC = () => {
  const { balance, setBalance, chartData, activities, stats } = useMockData();
  const [view, setView] = useState<View>('painel');
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isStakeModalOpen, setIsStakeModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isAddContactModalOpen, setIsAddContactModalOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; show: boolean } | null>(null);
  const [prefilledRecipient, setPrefilledRecipient] = useState<Contact | null>(null);
  const [contactToEdit, setContactToEdit] = useState<Contact | null>(null);
  
  const [contacts, setContacts] = useState<Contact[]>(() => {
    try {
      const savedContacts = window.localStorage.getItem(CONTACTS_STORAGE_KEY);
      return savedContacts ? JSON.parse(savedContacts) : initialContacts;
    } catch (error) {
      console.error('Error reading contacts from localStorage', error);
      return initialContacts;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(CONTACTS_STORAGE_KEY, JSON.stringify(contacts));
    } catch (error) {
      console.error('Error saving contacts to localStorage', error);
    }
  }, [contacts]);


  const handleConnectWallet = () => {
    const mockAddress = "0x" + [...Array(40)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
    setWalletAddress(mockAddress);
    setIsWalletModalOpen(false);
    setToast({ message: 'Carteira conectada com sucesso!', show: true });
  };

  const handleDisconnectWallet = () => {
    setWalletAddress(null);
  };
  
  const handleStake = (amount: number) => {
    if (amount <= 0 || amount > balance) return;
    setBalance(prev => prev - amount);
    setIsStakeModalOpen(false);
    setToast({ message: `${amount.toLocaleString('pt-BR')} RC apostados com sucesso!`, show: true });
  };

  const handleTransfer = (recipientAddress: string, amount: number) => {
    if (amount <= 0 || amount > balance || !recipientAddress) return;
    setBalance(prev => prev - amount);
    setIsTransferModalOpen(false);
    setPrefilledRecipient(null);
    const recipientContact = contacts.find(c => c.address === recipientAddress);
    const recipientName = recipientContact ? recipientContact.name : `${recipientAddress.slice(0, 6)}...${recipientAddress.slice(-4)}`;
    setToast({ message: `${amount.toLocaleString('pt-BR')} RC transferidos para ${recipientName}!`, show: true });
  };
  
  const handleSaveContact = (contactData: Omit<Contact, 'id' | 'imageUrl'>) => {
    if (contactToEdit) {
      // Update existing contact
      const updatedContact: Contact = { ...contactData, id: contactToEdit.id, imageUrl: contactToEdit.imageUrl };
      setContacts(contacts.map(c => c.id === contactToEdit.id ? updatedContact : c));
      setToast({ message: `Contato '${updatedContact.name}' atualizado!`, show: true });
    } else {
      // Add new contact
      const newContact: Contact = {
        ...contactData,
        id: Date.now(),
        imageUrl: `https://i.pravatar.cc/150?u=${Date.now()}`
      };
      setContacts(prev => [newContact, ...prev]);
      setToast({ message: `Contato '${newContact.name}' adicionado!`, show: true });
    }
    closeAddContactModal();
  };
  
  const handleDeleteContact = (contactId: number) => {
    if (window.confirm("Tem certeza que deseja excluir este contato?")) {
      const contactToDelete = contacts.find(c => c.id === contactId);
      setContacts(contacts.filter(c => c.id !== contactId));
      setToast({ message: `Contato '${contactToDelete?.name}' excluído.`, show: true });
    }
  };

  const openAddContactModal = () => {
    setContactToEdit(null);
    setIsAddContactModalOpen(true);
  };

  const openEditContactModal = (contact: Contact) => {
    setContactToEdit(contact);
    setIsAddContactModalOpen(true);
  };
  
  const closeAddContactModal = () => {
    setIsAddContactModalOpen(false);
    setContactToEdit(null);
  };

  const handleInitiateTransfer = (contact: Contact) => {
    setPrefilledRecipient(contact);
    setIsTransferModalOpen(true);
  };


  const renderContent = () => {
    switch (view) {
      case 'painel':
        return <Painel 
                  balance={balance} 
                  chartData={chartData} 
                  activities={activities} 
                  stats={stats} 
                  onStakeClick={() => setIsStakeModalOpen(true)} 
                  onTransferClick={() => setIsTransferModalOpen(true)} 
                />;
      case 'reputacao':
        return <Reputacao 
                  contacts={contacts} 
                  onAddContactClick={openAddContactModal}
                  onEditContact={openEditContactModal}
                  onDeleteContact={handleDeleteContact}
                  onInitiateTransfer={handleInitiateTransfer}
                />;
      case 'sobre':
        return <Sobre />;
      default:
        return <Painel 
                  balance={balance} 
                  chartData={chartData} 
                  activities={activities} 
                  stats={stats} 
                  onStakeClick={() => setIsStakeModalOpen(true)} 
                  onTransferClick={() => setIsTransferModalOpen(true)} 
                />;
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg-dark text-brand-text">
      <Header 
        currentView={view} 
        onNavigate={setView}
        walletAddress={walletAddress}
        onConnectClick={() => setIsWalletModalOpen(true)}
        onDisconnectClick={handleDisconnectWallet}
      />
      <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        {renderContent()}
      </main>
      <footer className="text-center p-6 text-brand-text-secondary text-sm">
        <p>&copy; {new Date().getFullYear()} Ecossistema REDICOIN. Todos os direitos reservados. Um projeto conceitual.</p>
      </footer>
      {isWalletModalOpen && (
        <WalletConnectModal 
          onClose={() => setIsWalletModalOpen(false)}
          onConnect={handleConnectWallet}
        />
      )}
      {isStakeModalOpen && (
        <StakeModal 
          balance={balance}
          onClose={() => setIsStakeModalOpen(false)}
          onStake={handleStake}
        />
      )}
      {isTransferModalOpen && (
        <TransferModal
          balance={balance}
          contacts={contacts}
          onClose={() => {
            setIsTransferModalOpen(false);
            setPrefilledRecipient(null);
          }}
          onTransfer={handleTransfer}
          prefilledRecipient={prefilledRecipient}
        />
      )}
      {isAddContactModalOpen && (
        <AddContactModal
          onClose={closeAddContactModal}
          onSave={handleSaveContact}
          contactToEdit={contactToEdit}
        />
      )}
      {toast && (
        <Toast 
          message={toast.message} 
          show={toast.show}
          onClose={() => setToast(null)} 
        />
      )}
    </div>
  );
};

export default App;