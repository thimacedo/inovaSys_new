import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import httpx
import json

# Carrega configurações manuais baseadas no .env.local
SUPABASE_URL = "https://tsgbvhfdceyjbyfstjol.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRzZ2J2aGZkY2V5amJ5ZnN0am9sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0NjY3MDEsImV4cCI6MjA5MDA0MjcwMX0.ucDetUUuVKyycACaNtzArQ8YpgybrRpQqYljYYiTgyI"
SMTP_USER = "inovasyscamara@gmail.com"
SMTP_PASS = "pC8_QjWH-9_NF0U"

def check_supabase():
    print("🔍 [SUPABASE] Verificando conexão...")
    endpoint = f"{SUPABASE_URL}/rest/v1/perfis?select=count"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Range": "0-0"
    }
    try:
        with httpx.Client() as client:
            response = client.get(endpoint, headers=headers)
            if response.status_code == 200:
                print(f"✅ [SUPABASE] Conectado com sucesso! Total de perfis detectados.")
                return True
            else:
                print(f"❌ [SUPABASE] Falha na conexão: {response.status_code} - {response.text}")
                return False
    except Exception as e:
        print(f"❌ [SUPABASE] Erro crítico: {str(e)}")
        return False

def check_email():
    print("\n📧 [EMAIL] Iniciando disparo de teste para inovasyscamara@gmail.com...")
    msg = MIMEMultipart()
    msg['From'] = SMTP_USER
    msg['To'] = SMTP_USER
    msg['Subject'] = "🚀 InovaSys - Teste de Infraestrutura MD3"
    
    body = "Este é um e-mail de validação automática da infraestrutura InovaSys após a refatoração para Material You (MD3)."
    msg.attach(MIMEText(body, 'plain'))
    
    try:
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(SMTP_USER, SMTP_PASS)
        server.send_message(msg)
        server.quit()
        print("✅ [EMAIL] Disparo concluído com sucesso!")
        return True
    except Exception as e:
        print(f"❌ [EMAIL] Falha ao enviar: {str(e)}")
        if "Authentication failed" in str(e):
            print("   💡 DICA: Verifique se a 'Senha de App' do Gmail está correta e o acesso 2FA está ativo.")
        return False

if __name__ == "__main__":
    print("🛠️ INOVASYS - INFRASTRUCTURE VALIDATION\n" + "="*40)
    s_ok = check_supabase()
    e_ok = check_email()
    
    if s_ok and e_ok:
        print("\n🏆 [RESULTADO FINAL] Infraestrutura TOTALMENTE OPERACIONAL!")
    else:
        print("\n⚠️ [RESULTADO FINAL] Existem pendências técnicas na infraestrutura.")
