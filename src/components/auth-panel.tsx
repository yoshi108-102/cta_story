import { EditorUser } from "../types/tree";

interface AuthPanelProps {
  user: EditorUser | null;
  loading: boolean;
  error: string | null;
  isMock: boolean;
  onLogin: () => Promise<void>;
  onLogout: () => Promise<void>;
}

export const AuthPanel = ({
  user,
  loading,
  error,
  isMock,
  onLogin,
  onLogout,
}: AuthPanelProps) => {
  if (loading) {
    return <p className="muted">認証状態を確認しています...</p>;
  }

  if (!user) {
    return (
      <div className="card">
        <h3>編集者ログイン</h3>
        <p className="muted">Googleログインで管理画面を利用できます。</p>
        <button type="button" onClick={onLogin}>
          Googleでログイン
        </button>
        {error ? <p className="error">{error}</p> : null}
      </div>
    );
  }

  return (
    <div className="card row-between">
      <div>
        <h3>編集者</h3>
        <p className="muted">
          {user.displayName || "No Name"} ({user.email || user.uid})
        </p>
        {isMock ? <p className="badge">mock mode</p> : null}
      </div>
      <button type="button" className="secondary" onClick={onLogout}>
        ログアウト
      </button>
    </div>
  );
};
