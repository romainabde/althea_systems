"use client";

export default function TrustSection() {
  const engagements = [
    {
      icon: "🚚",
      title: "Livraison 24/48h",
      desc: "Expédition rapide pour les urgences médicales."
    },
    {
      icon: "🛡️",
      title: "Normes CE Médicales",
      desc: "Matériel certifié ISO 13485 pour les hôpitaux."
    },
    {
      icon: "📞",
      title: "Support Technique 7j/7",
      desc: "Une équipe d'ingénieurs à votre écoute."
    },
    {
      icon: "💳",
      title: "Paiement Sécurisé",
      desc: "Transactions B2B encryptées (Stripe)."
    }
  ];

  return (
    <section style={{ backgroundColor: '#f8fafc', padding: '60px 20px', borderBottom: '1px solid #e2e8f0' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: '2rem', color: '#1e293b', marginBottom: '40px', fontWeight: 'bold' }}>
          Nos Engagements Althea Systems
        </h2>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '20px' }}>
          {engagements.map((item, index) => (
            <div key={index} style={{ 
              flex: '1 1 200px', 
              backgroundColor: 'white', 
              padding: '30px 20px', 
              borderRadius: '12px', 
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '15px' }}>{item.icon}</div>
              <h3 style={{ fontSize: '1.2rem', color: '#0f172a', marginBottom: '10px', fontWeight: '600' }}>{item.title}</h3>
              <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: '1.5' }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}