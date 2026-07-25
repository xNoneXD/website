const menuToggle = document.querySelector('.menu-toggle');
const siteNav = document.querySelector('.site-nav');
const navLinks = document.querySelectorAll('.site-nav a');
const revealItems = document.querySelectorAll('.reveal');
const cursorGlow = document.querySelector('.cursor-glow');
const year = document.querySelector('#year');
const discordCard = document.querySelector('[data-discord-id]');
const discordAvatar = document.querySelector('[data-discord-avatar]');
const discordName = document.querySelector('[data-discord-name]');
const discordActivity = document.querySelector('[data-discord-activity]');
const discordStatusCard = document.querySelector('[data-discord-status]');
const discordStatusText = document.querySelector('[data-discord-status-text]');

if (year) {
  year.textContent = new Date().getFullYear();
}

menuToggle.addEventListener('click', () => {
  siteNav.classList.toggle('open');
});

navLinks.forEach((link) => {
  link.addEventListener('click', () => {
    siteNav.classList.remove('open');
  });
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  },
  { threshold: 0.18 }
);

revealItems.forEach((item) => revealObserver.observe(item));

const sections = document.querySelectorAll('section[id]');
const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      navLinks.forEach((link) => {
        link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`);
      });
    });
  },
  { threshold: 0.45 }
);

sections.forEach((section) => sectionObserver.observe(section));

const statusTextMap = {
  online: 'Online',
  idle: 'Idle',
  dnd: 'Do Not Disturb',
  offline: 'Offline'
};

function getAvatarUrl(user) {
  const extension = user.avatar && user.avatar.startsWith('a_') ? 'gif' : 'png';

  if (!user.avatar) {
    return `https://cdn.discordapp.com/embed/avatars/${Number(user.discriminator || 0) % 5}.png`;
  }

  return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${extension}?size=256`;
}

function getActivityText(activities) {
  const customStatus = activities.find((activity) => activity.type === 4 && activity.state);
  const playing = activities.find((activity) => activity.type === 0 && activity.name);
  const listening = activities.find((activity) => activity.type === 2 && activity.name);

  if (customStatus) return customStatus.state;
  if (playing) return `Playing ${playing.name}`;
  if (listening) return `Listening to ${listening.name}`;

  return 'No activity right now';
}

async function loadDiscordProfile() {
  if (!discordCard) return;

  const discordId = discordCard.dataset.discordId;

  try {
    const response = await fetch(`https://api.lanyard.rest/v1/users/${discordId}`);
    const result = await response.json();

    if (!result.success) {
      throw new Error('Discord profile unavailable');
    }

    const { discord_user: user, discord_status: status, activities } = result.data;

    discordAvatar.src = getAvatarUrl(user);
    discordName.textContent = user.global_name || user.username;
    discordActivity.textContent = getActivityText(activities || []);
    discordStatusCard.dataset.discordStatus = status || 'offline';
    discordStatusText.textContent = statusTextMap[status] || 'Offline';
  } catch (error) {
    discordAvatar.alt = 'Discord avatar unavailable';
    discordName.textContent = 'xNone';
    discordActivity.textContent = 'Discord status unavailable';
    discordStatusCard.dataset.discordStatus = 'offline';
    discordStatusText.textContent = 'Offline';
  }
}

loadDiscordProfile();
setInterval(loadDiscordProfile, 60000);

window.addEventListener('pointermove', (event) => {
  cursorGlow.style.left = `${event.clientX}px`;
  cursorGlow.style.top = `${event.clientY}px`;
});