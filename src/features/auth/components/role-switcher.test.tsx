import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import * as React from 'react';
import { RoleSwitcher } from './role-switcher';
import { DEMO_USERS } from '../types/auth.types';

const mockSwitchRole = vi.fn();
const mockLogout = vi.fn();
let activeUser = DEMO_USERS.admin;

vi.mock('../hooks/use-auth', () => ({
  useAuth: () => ({
    user: activeUser,
    switchRole: mockSwitchRole,
    isSwitchingRole: false,
    logout: mockLogout,
    isLoggingOut: false,
    isAuthenticated: true,
    role: activeUser.role,
  }),
}));

describe('RoleSwitcher Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    activeUser = DEMO_USERS.admin;
  });

  it('renders current persona badge and user info', () => {
    render(<RoleSwitcher />);

    expect(screen.getByText('Sarah Connor')).toBeInTheDocument();
    expect(screen.getByText('System Administrator')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it('renders different persona info when active user changes', () => {
    activeUser = DEMO_USERS.analyst;
    render(<RoleSwitcher />);

    expect(screen.getByText('Marcus Brody')).toBeInTheDocument();
    expect(screen.getByText('Financial Analyst')).toBeInTheDocument();
    expect(screen.getByText('Analyst')).toBeInTheDocument();
  });

  it('opens dropdown and displays all 4 enterprise operator personas', () => {
    render(<RoleSwitcher />);

    const trigger = screen.getByRole('button', { name: /current persona/i });
    fireEvent.click(trigger);

    expect(screen.getByText('Switch Operator Persona')).toBeInTheDocument();
    expect(screen.getByText('Elena Vance')).toBeInTheDocument();
    expect(screen.getByText('Operations Manager')).toBeInTheDocument();
    expect(screen.getByText('Diana Prince')).toBeInTheDocument();
    expect(screen.getByText('Viewer')).toBeInTheDocument();
  });

  it('calls switchRole when an inactive persona is selected', () => {
    activeUser = DEMO_USERS.admin;
    render(<RoleSwitcher />);

    const trigger = screen.getByRole('button', { name: /current persona/i });
    fireEvent.click(trigger);

    const opsLeadOption = screen.getByText('Elena Vance');
    fireEvent.click(opsLeadOption);

    expect(mockSwitchRole).toHaveBeenCalledWith('operations_lead');
  });

  it('does not trigger switchRole when already active persona is clicked', () => {
    activeUser = DEMO_USERS.admin;
    render(<RoleSwitcher />);

    const trigger = screen.getByRole('button', { name: /current persona/i });
    fireEvent.click(trigger);

    // Sarah Connor is active
    const adminOption = screen.getAllByText('Sarah Connor')[1]; // second one in menu item
    expect(adminOption).toBeDefined();
    if (adminOption) {
      fireEvent.click(adminOption);
    }

    expect(mockSwitchRole).not.toHaveBeenCalled();
  });

  it('calls logout when Sign Out is clicked', () => {
    render(<RoleSwitcher />);

    const trigger = screen.getByRole('button', { name: /current persona/i });
    fireEvent.click(trigger);

    const signOutBtn = screen.getByText('Sign Out');
    fireEvent.click(signOutBtn);

    expect(mockLogout).toHaveBeenCalledTimes(1);
  });
});
