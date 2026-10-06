import { useEffect, useState } from 'react';
import Workspace from './components/Workspace.jsx';

export default function App() {
  const [state, setState] = useState({ status: 'loading' });

  async function loadReceipt() {
    setState({ status: 'loading' });
    try {
      // For now the server always answers with the sample receipt.
      const res = await fetch('/api/parse-receipt', { method: 'POST' });
      if (!res.ok) throw new Error(`The server answered with error ${res.status}.`);
      setState({ status: 'ready', receipt: await res.json() });
    } catch (err) {
      setState({ status: 'error', message: err.message });
    }
  }

  useEffect(() => {
    loadReceipt();
  }, []);

  if (state.status === 'loading') {
    return (
      <div className="center-screen">
        <div className="spinner" aria-hidden="true" />
        <p>Reading receipt…</p>
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div className="center-screen">
        <p>Couldn't read the receipt. {state.message}</p>
        <button className="primary" onClick={loadReceipt}>
          Try again
        </button>
      </div>
    );
  }

  return <Workspace receipt={state.receipt} />;
}
