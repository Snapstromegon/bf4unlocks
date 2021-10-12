---
layout: main.njk
permalink:
  serverless: /unlocks/
eleventyComputed:
  playerName: "{{ eleventy.serverless.query.playerName | default: 'Snapstromegon' }}"
---

# BF4 Unlocker 

## Player {{ playerWeaponData.player.personaName }} ({{ playerName }})

{% assign sortedWeapons = playerWeaponData.weaponProgress | sort: "nextUnlockKills" %}

<div class="weapons">
{% for weapon in sortedWeapons %}
{% if weapon.nextUnlock.name contains "Battelpack" %}
{% else %}

<div class="weapon">

### {{ weapon.category }}/{{ weapon.slug | upcase }} ({{ weapon.nextUnlockKills }})

<div class="weaponUnlocks">
{% assign lastValueNeeded = 0 %}
{% for unlock in weapon.unlockTree %}
<div class="weaponUnlock {% if weapon.kills >= unlock.valueNeeded %}completed{% elsif weapon.kills >= lastValueNeeded %}active{% else %}open{% endif %}" style="
  --weapon-kills: {{ weapon.kills }};
  --unlock-completed: {{ unlock.valueNeeded }};
  --unlock-start: {{ lastValueNeeded }};">
<p class="valueNeeded">{{ weapon.kills | at_most: unlock.valueNeeded }} / {{ unlock.valueNeeded }} {% if weapon.kills < unlock.valueNeeded and weapon.kills >= lastValueNeeded %}
({{ unlock.valueNeeded | minus: weapon.kills }})
{% endif %}</p>
<p class="name">{{ unlock.name }}</p>
</div>
{% assign lastValueNeeded = unlock.valueNeeded %}
{% endfor %}
</div>
</div>
{% endif %}
{% endfor %}
</div>
