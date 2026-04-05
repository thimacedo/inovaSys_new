#!/bin/bash
# Arquivo: scripts/setup-test-db.sh
# Comando para garantir sincronia do ambiente local e CI com as migrations

supabase start
supabase db reset
