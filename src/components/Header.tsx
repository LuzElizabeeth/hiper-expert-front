import { Bell, UserRound } from 'lucide-react';

type HeaderProps = {
  title?: string;
};

export const Header = ({ title = 'HiperExpert' }: HeaderProps) => {
  return (
    <header className="header">
      <div className="user-badge">
        <div className="avatar">
          <UserRound size={22} />
        </div>

        <div>
          <p className="hello">Paciente</p>
          <h1>{title}</h1>
        </div>
      </div>

      <button className="icon-button">
        <Bell size={19} />
      </button>
    </header>
  );
};