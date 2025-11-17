import React from 'react';

export interface Activity {
  id: number;
  description: string;
  amount: number;
  type: 'gain' | 'loss';
  timestamp: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface ChartData {
  date: string;
  value: number;
}

export interface Stats {
  marketCap: string;
  holders: string;
  transactions: string;
  change: number;
}

export type View = 'painel' | 'reputacao' | 'sobre';

export type ContactType = 'pessoa' | 'empresa';

export interface Contact {
  id: number;
  name: string;
  username: string;
  address: string;
  imageUrl: string;
  type: ContactType;
}
