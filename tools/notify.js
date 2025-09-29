import fetch from 'node-fetch';

export async function notifySlack(message) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  
  if (!webhookUrl) {
    console.log('⚠️ SLACK_WEBHOOK_URL non configurée, notification ignorée');
    return;
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: message,
        username: 'Ges-Cab Security Bot',
        icon_emoji: ':key:'
      })
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    console.log('✅ Notification Slack envoyée');
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de la notification Slack:', error.message);
  }
}