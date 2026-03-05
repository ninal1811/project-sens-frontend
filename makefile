FORCE:

# Code quality
lint: FORCE
	npm run lint

lint_fix: FORCE
	npm run lint --fix

format: FORCE
	npx prettier --write .

type_check: FORCE
	npx tsc --noEmit
	
# Install dependencies
dev_env: FORCE
	npm install

clean: FORCE
	rm -rf node_modules dist .cache

reinstall: clean dev_env

env: FORCE
	cp .env.example .env

# Run tests (currently just States)
tests: FORCE
	npm test

# Watch mode for development to run tests continuously
test_watch: FORCE
	npm run test:watch

# Build the project
build: FORCE
	npm run build

dev: tests FORCE
	npm run dev

# GitHub deployment
github: FORCE
	-git commit -a
	git push origin main

# Production deployment (run tests first)
prod: tests github

ci: FORCE
	npm ci
	npm run lint
	npx tsc --noEmit
	npm test
	npm run build

open: FORCE
	open http://localhost:5173

ping_backend: FORCE
	curl -s https://projectsens.pythonanywhere.com/countries | python3 -m json.tool | head -20