import { useState } from 'react'; 

function App() {
  const [name, setName] = useState('');
  const [userInfo, setUserInfo] = useState(null);
  const [errorMessage, setErrorMessage] = useState(''); // Ajout de l'état pour gérer les erreurs
  const [file, setFile] = useState(null);
  const [fileInfo, setFileInfo] = useState(null);
  const [externalUrl, setExternalUrl] = useState('');
  const [downloadedFile, setDownloadedFile] = useState(null);
  const [externalError, setExternalError] = useState(''); // Ajout de l'état pour gérer l'erreur de téléchargement externe

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch('http://backend-demo.stage.lab/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    let data;
    try {
      data = await res.json();
    } catch {
      setErrorMessage('Utilisateur non trouvé');
      return;
    }
    if (!res.ok) {
      setErrorMessage('Utilisateur non trouvé'); // Affiche le message d'erreur personnalisé
      setUserInfo(null); // Si l'utilisateur n'est pas trouvé, réinitialiser les informations
    } else {
      setUserInfo(data);
      setErrorMessage(''); // Réinitialiser le message d'erreur si l'utilisateur est trouvé
    }
  };

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!file) return alert('Veuillez sélectionner un fichier');
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('http://backend-demo.stage.lab/upload', {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    res.ok ? setFileInfo(data) : alert('Erreur upload');
  };

  const handleFileDownload = (filename) => {
    window.location.href = `http://backend-demo.stage.lab/download/${filename}`;
  };

  const handleExternalDownload = async () => {
    if (!externalUrl) {
      setExternalError('Veuillez entrer un lien valide pour télécharger'); // Affiche un message si le lien est vide
      return;
    }

    const res = await fetch('http://backend-demo.stage.lab/downloadExternal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: externalUrl })
    });

    const data = await res.json();
    if (res.ok) {
      setDownloadedFile(data.filename);
      setExternalError(''); // Réinitialise le message d'erreur si le téléchargement est réussi
    } else {
      setExternalError('Erreur de téléchargement depuis le lien'); // Affiche un message d'erreur si la réponse est négative
    }
  };

  return (
    <div className="App bg-gray-100 min-h-screen flex items-center justify-center py-10">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-center text-blue-700 mb-6">Bienvenue</h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <p>Entrer le nom d'utilisateur</p>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-2 border rounded" placeholder="Nom" required />
          <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">Soumettre</button>
        </form>

        {errorMessage && (
          <div className="text-red-600 mt-4">
            <p>{errorMessage}</p>
          </div>
        )}

        {userInfo && (
          <div className="mt-6">
            <h2 className="font-bold">Infos utilisateur :</h2>
            {userInfo.map((user, i) => (
              <div key={i} className="text-sm">{Object.entries(user).map(([k, v]) => <p key={k}><b>{k}</b>: {v}</p>)}</div>
            ))}
          </div>
        )}

        <form onSubmit={handleFileUpload} className="space-y-5 mt-8">
          <input type="file" onChange={handleFileChange} className="w-full p-2 border rounded" />
          <button type="submit" className="w-full bg-green-600 text-white p-2 rounded">Télécharger</button>
        </form>

        {fileInfo && (
          <div className="mt-4">
            <p>Fichier téléchargé : <a href={`http://backend-demo.stage.lab/download/${fileInfo.file.filename}`} className="text-blue-500 hover:underline">{fileInfo.file.filename}</a></p>
          </div>
        )}

        <div className="mt-8">
          <h3 className="font-bold">Télécharger depuis un lien externe</h3>
          <input
            type="text"
            placeholder="Collez un lien (ex. Google Drive direct)"
            value={externalUrl}
            onChange={(e) => setExternalUrl(e.target.value)}
            className="w-full p-2 border mt-2 mb-2 rounded"
          />
          <button onClick={handleExternalDownload} className="w-full bg-purple-600 text-white py-2 rounded">Télécharger</button>
          {externalError && (
            <div className="text-red-600 mt-4">
              <p>{externalError}</p> {/* Affiche l'erreur de téléchargement ici */}
            </div>
          )}
          {downloadedFile && (
            <div className="mt-3">
              <p className="font-semibold">Fichier téléchargé :</p>
              <a
                href={`http://backend-demo.stage.lab/download/${downloadedFile}`}
                className="text-blue-600 hover:underline"
              >
                {downloadedFile}
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
