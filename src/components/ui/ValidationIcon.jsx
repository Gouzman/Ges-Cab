import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

const ValidationIcon = ({ isValid }) => {
  return isValid ? (
    <CheckCircle className="w-4 h-4 text-green-500" />
  ) : (
    <XCircle className="w-4 h-4 text-red-500" />
  );
};

export default ValidationIcon;