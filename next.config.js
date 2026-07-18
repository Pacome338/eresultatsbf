/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  async headers() {
    return [
      {
        // S'applique à tout le site, en particulier utile pour /admin.
        source: '/:path*',
        headers: [
          // Empêche le site d'être affiché dans une <iframe> ailleurs
          // (protection contre le clickjacking sur le formulaire admin).
          { key: 'X-Frame-Options', value: 'DENY' },
          // Empêche le navigateur de deviner un type de fichier différent
          // de celui déclaré (protection contre certaines injections).
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Limite les informations envoyées vers d'autres sites via le
          // référent lors d'un clic sortant.
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
