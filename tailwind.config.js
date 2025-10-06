/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: ['class'],
	content: [
		'./pages/**/*.{js,jsx}',
		'./components/**/*.{js,jsx}',
		'./app/**/*.{js,jsx}',
		'./src/**/*.{js,jsx}',
	],
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px',
			},
		},
		extend: {
			fontFamily: {
				sans: ['Inter', 'Roboto', 'Open Sans', 'sans-serif'],
			},
			colors: {
				// Charte Graphique "Tâche Cabinet" - Couleurs Principales
				background: 'hsl(222.2 84% 4.9%)',        // Très sombre, bleuté
				foreground: 'hsl(210 40% 98%)',           // Blanc cassé
				border: 'hsl(217.2 32.6% 17.5%)',         // Gris bleu sombre
				
				// Variables CSS pour composants
				'cabinet-bg': 'hsl(var(--cabinet-bg))',
				'cabinet-text': 'hsl(var(--cabinet-text))',
				'cabinet-border': 'hsl(var(--cabinet-border))',
				
				// Couleurs Primaires
				primary: {
					DEFAULT: 'hsl(217.2 91.2% 59.8%)',     // Bleu vif principal
					foreground: 'hsl(210 40% 98%)',        // Blanc cassé
				},
				secondary: {
					DEFAULT: 'hsl(217.2 32.6% 17.5%)',     // Gris bleu foncé
					foreground: 'hsl(210 40% 98%)',
				},
				
				// Couleurs Fonctionnelles
				destructive: {
					DEFAULT: 'hsl(0 62.8% 30.6%)',         // Rouge sombre
					foreground: 'hsl(210 40% 98%)',
				},
				accent: {
					DEFAULT: 'hsl(217.2 32.6% 17.5%)',
					foreground: 'hsl(210 40% 98%)',
				},
				muted: {
					DEFAULT: 'hsl(215 20.2% 65.1%)',
					foreground: 'hsl(215.4 16.3% 46.9%)',
				},
				
				// États et Statuts
				'status-pending': 'hsl(25 95% 53%)',      // Orange-500
				'status-viewed': 'hsl(271 81% 56%)',      // Purple-500  
				'status-progress': 'hsl(217 91% 60%)',    // Blue-500
				'status-completed': 'hsl(142 76% 36%)',   // Green-500
				'status-total': 'hsl(215 25% 27%)',       // Slate-600
				
				// Priorités
				'priority-urgent': 'hsl(0 84% 60%)',      // Red-500
				'priority-high': 'hsl(25 95% 53%)',       // Orange-500
				'priority-medium': 'hsl(45 93% 47%)',     // Yellow-500
				
				// Types de Clients
				'client-entreprise': 'hsl(217 91% 60%)',  // Blue-500
				'client-particulier': 'hsl(271 81% 56%)', // Purple-500
				
				// Variables compatibles shadcn/ui
				input: 'hsl(var(--cabinet-border))',
				ring: 'hsl(217.2 91.2% 59.8%)',
				popover: {
					DEFAULT: 'hsl(222.2 84% 4.9%)',
					foreground: 'hsl(210 40% 98%)',
				},
				card: {
					DEFAULT: 'hsl(222.2 84% 4.9%)',
					foreground: 'hsl(210 40% 98%)',
				},
			},
			borderRadius: {
				lg: '0.5rem',                              // Large
				md: 'calc(0.5rem - 2px)',                 // Moyen 
				sm: 'calc(0.5rem - 4px)',                 // Petit
			},
			
			// Dégradés de la Charte
			backgroundImage: {
				'cabinet-main': 'linear-gradient(135deg, hsl(215 25% 27%) 0%, hsl(217 33% 17%) 25%, hsl(222 47% 11%) 50%, hsl(222 84% 5%) 100%)',
				'btn-primary': 'linear-gradient(to right, hsl(217 91% 60%), hsl(231 76% 60%))',
				'btn-success': 'linear-gradient(to right, hsl(142 76% 36%), hsl(158 64% 52%))',
				'btn-violet': 'linear-gradient(to right, hsl(271 81% 56%), hsl(271 81% 56%))',
			},
			
			// Animations Charte Cabinet
			keyframes: {
				'cabinet-hover': {
					'0%': { transform: 'translateY(0px)' },
					'100%': { transform: 'translateY(-1px)' },
				},
				'cabinet-active': {
					'0%': { transform: 'translateY(-1px)' },
					'100%': { transform: 'translateY(0px)' },
				},
				'accordion-down': {
					from: { height: 0 },
					to: { height: 'var(--radix-accordion-content-height)' },
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: 0 },
				},
			},
			animation: {
				'cabinet-hover': 'cabinet-hover 0.2s ease-out',
				'cabinet-active': 'cabinet-active 0.2s ease-out', 
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
			},
			
			// Box Shadow Focus
			boxShadow: {
				'cabinet-focus': '0 0 0 2px rgba(59, 130, 246, 0.5)',
			},
		},
	},
	plugins: [
		require('tailwindcss-animate'),
		// Plugin pour scrollbar personnalisée
		function({ addUtilities }) {
			addUtilities({
				'.scrollbar-cabinet': {
					'scrollbar-width': '8px',
					'&::-webkit-scrollbar': {
						width: '8px',
					},
					'&::-webkit-scrollbar-track': {
						background: 'rgba(51, 65, 85, 0.3)',
						borderRadius: '4px',
					},
					'&::-webkit-scrollbar-thumb': {
						background: 'rgba(100, 116, 139, 0.5)',
						borderRadius: '4px',
					},
					'&::-webkit-scrollbar-thumb:hover': {
						background: 'rgba(100, 116, 139, 0.7)',
					},
				},
			});
		},
	],
};