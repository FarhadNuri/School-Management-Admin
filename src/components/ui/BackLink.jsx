import React from 'react';
import { useNavigate } from 'react-router-dom';

export function BackLink({ to, label, onClick }) {
  const navigate = useNavigate();

  const handleClick = (e) => {
    e.preventDefault();
    if (onClick) {
      onClick();
    } else if (to) {
      navigate(to);
    } else {
      navigate(-1);
    }
  };

  return (
    <button type="button" className="bk" onClick={handleClick}>
      ← {label}
    </button>
  );
}
