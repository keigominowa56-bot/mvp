# Nginx サーバーブロック設定

このディレクトリには、各ドメイン用のサーバーブロック設定ファイルが含まれています。

## 設定ファイル

- `default.conf` - すべてのドメイン（polimee.com, www.polimee.com, api.polimee.com, admin.polimee.com）の設定

## Certbot の所有権確認

各サーバーブロックには `.well-known/acme-challenge/` へのアクセス設定が含まれています。
Certbot が SSL 証明書を取得する際に、このパスを使用してドメインの所有権を確認します。

証明書ファイルは `/var/www/certbot` ディレクトリに配置されます。

