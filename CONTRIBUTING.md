# Contributing to Memberstack Skills

Thank you for your interest in contributing to the Memberstack Skills for Claude Code!

## How to Contribute

### Reporting Issues

- Check existing issues to avoid duplicates
- Use a clear, descriptive title
- Include steps to reproduce the issue
- Mention your Claude Code version and OS

### Suggesting Improvements

- Open an issue describing the enhancement
- Explain the use case and benefit
- Include examples if possible

### Submitting Changes

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Make your changes
4. Test your changes with the Memberstack MCP
5. Commit with clear messages (`git commit -m "Add: description of change"`)
6. Push to your fork (`git push origin feature/your-feature`)
7. Open a Pull Request

## Skill Structure

```
memberstack/
├── SKILL.md                    # Main skill file with frontmatter
└── references/
    ├── mcp-tools.md            # MCP tool documentation
    ├── webflow-attributes.md   # Webflow data-ms-* attributes
    └── workflows.md            # Common workflow patterns
```

## Guidelines

### SKILL.md

- Keep the main file concise (<500 lines)
- Focus on procedural knowledge Claude doesn't inherently have
- Use tables for quick reference
- Point to reference files for detailed information

### Reference Files

- Organize by topic (tools, attributes, workflows)
- Include examples where helpful
- Keep documentation accurate to actual MCP schemas
- Verify against `memberstackKnowledgeSearch` when possible

### Testing Changes

Before submitting:

1. Install the Memberstack MCP
2. Load your modified skill
3. Test relevant MCP operations
4. Verify documentation matches actual tool schemas

```bash
# Test with the MCP
claude mcp add memberstack --scope user npx mcp-remote https://mcp.memberstack.com/mcp
```

### Commit Messages

Use clear prefixes:
- `Add:` for new features
- `Fix:` for bug fixes
- `Update:` for documentation updates
- `Remove:` for deletions

## Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help others learn and grow

## Questions?

Open an issue or reach out to the Memberstack team.
