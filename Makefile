.PHONY: help dev
.DEFAULT_GOAL := help

help:
	@echo ""
	@echo "  🛠️  Development:"
	@echo "    dev                - Start Next.js dev server"
	@echo ""

dev:
	npm run dev
