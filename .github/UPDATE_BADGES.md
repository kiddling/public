# Updating CI Badges

After setting up your repository, update the CI badges in README.md.

## Current Badges

The README currently has placeholder badges:
```markdown
[![CI](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/ci.yml/badge.svg)](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/ci.yml)
[![Build and Push](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/build-and-push.yml/badge.svg)](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/build-and-push.yml)
```

## How to Update

Replace `YOUR_USERNAME` and `YOUR_REPO` with your actual GitHub username and repository name.

For example, if your repository is `https://github.com/acme-edu/nuxt-strapi-app`, replace:
- `YOUR_USERNAME` → `acme-edu`
- `YOUR_REPO` → `nuxt-strapi-app`

### Using sed (macOS/Linux)

```bash
# Set your values
USERNAME="your-github-username"
REPO="your-repo-name"

# Update README
sed -i.bak "s/YOUR_USERNAME/$USERNAME/g" README.md
sed -i.bak "s/YOUR_REPO/$REPO/g" README.md

# Remove backup
rm README.md.bak
```

### Manual Update

Open `README.md` and change line 3-4 from:
```markdown
[![CI](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/ci.yml/badge.svg)](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/ci.yml)
[![Build and Push](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/build-and-push.yml/badge.svg)](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/build-and-push.yml)
```

To:
```markdown
[![CI](https://github.com/acme-edu/nuxt-strapi-app/actions/workflows/ci.yml/badge.svg)](https://github.com/acme-edu/nuxt-strapi-app/actions/workflows/ci.yml)
[![Build and Push](https://github.com/acme-edu/nuxt-strapi-app/actions/workflows/build-and-push.yml/badge.svg)](https://github.com/acme-edu/nuxt-strapi-app/actions/workflows/build-and-push.yml)
```

## Badge Status

After your first workflow run, the badges will show:
- ✅ **Passing** - Green badge
- ❌ **Failing** - Red badge
- ⚠️ **No status** - Gray badge (workflows not run yet)

## Custom Badge Styles

You can customize badge appearance by adding query parameters:

### Flat Style
```markdown
[![CI](https://github.com/USER/REPO/actions/workflows/ci.yml/badge.svg?style=flat)](...)
```

### Flat Square
```markdown
[![CI](https://github.com/USER/REPO/actions/workflows/ci.yml/badge.svg?style=flat-square)](...)
```

### For the Badge
```markdown
[![CI](https://github.com/USER/REPO/actions/workflows/ci.yml/badge.svg?style=for-the-badge)](...)
```

## Branch-Specific Badges

To show status for a specific branch:
```markdown
[![CI](https://github.com/USER/REPO/actions/workflows/ci.yml/badge.svg?branch=main)](...)
```

## Event-Specific Badges

To show status for specific events:
```markdown
[![CI](https://github.com/USER/REPO/actions/workflows/ci.yml/badge.svg?event=push)](...)
```

## Alternative: Shields.io Badges

For more customization options, use shields.io:

```markdown
![CI](https://img.shields.io/github/actions/workflow/status/USER/REPO/ci.yml?label=CI&logo=github)
![Build](https://img.shields.io/github/actions/workflow/status/USER/REPO/build-and-push.yml?label=Build&logo=docker)
```

## Verifying Badges

After updating:
1. Commit and push your changes
2. View your README on GitHub
3. Badges should appear (may be gray until first workflow run)
4. Click badges to view workflow runs

## Troubleshooting

### Badge shows "no status"
- Workflows haven't run yet
- Wait for first PR or push to trigger workflows

### Badge shows 404
- Repository name is incorrect
- Workflow file name doesn't match
- Repository is private (badges work differently)

### Badge doesn't update
- Clear browser cache
- Wait a few minutes (GitHub caches badges)
- Check if workflow actually ran
